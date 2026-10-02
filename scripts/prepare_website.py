"""Prepare public website media and static documentation without changing evidence.

Media and staged guides live in website/.publication; the build writes dist/.
The original public/static
tree, frozen reports and runtime pins are read only. Web movies retain their
frame rate and complete timeline; their new byte hashes are recorded separately.
"""

import argparse
import concurrent.futures
import hashlib
import html
import json
import os
import re
import shutil
import subprocess
import tarfile
import urllib.parse
from pathlib import Path

from fetch_paper_artifacts import safe_path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "website"
OUTPUT = SITE / ".publication"
CONFIG = json.loads((SITE / "publication.json").read_text())


def sha(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def presentation_copy(content):
    content = content.replace("https://dancher00.github.io/wasserman-site/", CONFIG["site_url"])
    content = content.replace(
        "https://dancher00.github.io/WasserMan-Bench", CONFIG["site_url"].rstrip("/")
    )
    content = content.replace("https://github.com/dancher00/wasserman-site", "https://github.com/dancher00/dancher00.github.io")
    content = re.sub(
        r"https://github\.com/dancher00/WasserMan-Bench/releases/[^\s)\"]+",
        CONFIG["site_url"] + "docs/artifacts/", content
    )
    content = re.sub(
        r"https://github\.com/dancher00/WasserMan-Bench(?!/releases)", "https://github.com/dancher00/wasserman", content
    )
    content = re.sub(r"WasserMan-Bench(?![-./])", "WasserMan", content)
    return re.sub(r"expert demonstrations?", "recorded trajectories", content, flags=re.IGNORECASE)


def prepare_media(ffmpeg, workers):
    source = SITE / "public"
    destination = OUTPUT / "public"
    manifest_path = OUTPUT / "media-manifest.json"
    previous = json.loads(manifest_path.read_text()) if manifest_path.exists() else {"files": {}}
    rows = {}
    files = []
    withdrawn_path = SITE / "media-withdrawals.json"
    withdrawn = set(json.loads(withdrawn_path.read_text())["sha256"]) if withdrawn_path.exists() else set()
    selected_overview = (
        json.loads((SITE / "src/overviewVideo.json").read_text())["src"].split("?")[0].removeprefix("./")
    )
    selected_folder = Path(selected_overview).parent
    for path in sorted(source.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(source)
        # shared/ is a content-addressed archive store. Vite materializes the
        # named aliases below; shipping both doubles those files. Source ZIPs
        # and superseded manuscripts stay in the complete research package.
        if relative == Path("media-manifest.json") or "shared" in relative.parts or path.suffix == ".zip":
            continue
        if path.suffix == ".pdf":
            continue
        if (
            relative.parts[:2] == ("static", "publication")
            and relative.parts[2].startswith("overview")
            and relative.parent != selected_folder
        ):
            continue
        if path.suffix == ".mp4" and (
            sha(path) in withdrawn
            or (
                previous["files"].get(relative.as_posix(), {}).get("source_sha256") in withdrawn
                and previous["files"].get(relative.as_posix(), {}).get("web_sha256") == sha(path)
            )
        ):
            continue
        files.append((path, relative))

    def prepare(item):
        path, relative = item
        target = destination / relative
        source_hash = sha(path)
        old = previous["files"].get(relative.as_posix(), {})
        text_copy = path.suffix in {".html", ".md", ".txt"}
        text_method = (
            "Presentation text normalized to WasserMan v0.1.0; original source hash retained; "
            "separate website repository; canonical URL " + CONFIG["site_url"]
        )
        if (
            old.get("source_sha256") == source_hash
            and target.is_file()
            and sha(target) == old.get("web_sha256")
            and (not text_copy or old.get("method") == text_method)
        ):
            return relative.as_posix(), old
        target.parent.mkdir(parents=True, exist_ok=True)
        partial = target.with_name(target.stem + ".partial" + target.suffix)
        # This editorial master already has a compact H.264 stream. Keep its
        # 1080p titles, camera panels and result labels at their native size.
        overview_master = bool(
            re.fullmatch(r"static/publication/overview-v\d+/WasserMan-overview-v\d+\.mp4", relative.as_posix())
        )
        if path.suffix == ".mp4" and not overview_master:
            subprocess.run(
                [
                    ffmpeg,
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-y",
                    "-threads",
                    "2",
                    "-i",
                    str(path),
                    "-map",
                    "0:v:0",
                    "-map",
                    "0:a?",
                    "-vf",
                    "scale=w='min(1280,iw)':h='min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
                    "-c:v",
                    "libx264",
                    "-preset",
                    "veryfast",
                    "-crf",
                    "28",
                    "-threads",
                    "2",
                    "-pix_fmt",
                    "yuv420p",
                    "-c:a",
                    "copy",
                    "-movflags",
                    "+faststart",
                    str(partial),
                ],
                check=True,
            )
            method = "H.264 CRF 28, at most 1280×720, original frame rate and full timeline, audio stream copied"
        elif text_copy:
            partial.write_text(presentation_copy(path.read_text()))
            method = text_method
        else:
            shutil.copyfile(path, partial)
            method = "byte-identical copy"
        partial.replace(target)
        return relative.as_posix(), {
            "source_sha256": source_hash,
            "source_bytes": path.stat().st_size,
            "web_sha256": sha(target),
            "web_bytes": target.stat().st_size,
            "method": method,
        }

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        for index, (name, row) in enumerate(pool.map(prepare, files), 1):
            rows[name] = row
            if index % 40 == 0:
                print(f"Prepared {index}/{len(files)} files", flush=True)
    for path in destination.rglob("*"):
        if path.is_file() and path.relative_to(destination).as_posix() not in rows:
            path.unlink()
    result = {
        "schema": 1,
        "scope": "Web presentation derivatives; original scientific evidence remains in the bundled scientific evidence",
        "files": rows,
        "total_bytes": sum(row["web_bytes"] for row in rows.values()),
    }
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(result, indent=2) + "\n")
    (destination / "media-manifest.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"files": len(rows), "bytes": result["total_bytes"]}))


def restore_media(archive):
    """Restore a verified media-only archive; never overwrite different files."""
    manifest = json.loads((SITE / "media-package.json").read_text())
    if archive.stat().st_size != manifest["bytes"] or sha(archive) != manifest["sha256"]:
        raise ValueError("Website media archive does not match its pinned digest")
    destination = SITE / "public"
    destination.mkdir(parents=True, exist_ok=True)
    with tarfile.open(archive) as stream:
        members = stream.getmembers()
        for member in members:
            target = destination / member.name
            if Path(member.name).is_absolute() or not target.resolve().is_relative_to(destination.resolve()):
                raise ValueError("Unsafe media archive path: " + member.name)
            if not (member.isfile() or member.isdir()):
                raise ValueError("Media archives must contain regular files, not links")
            if member.isfile() and target.exists():
                with stream.extractfile(member) as incoming:
                    digest = hashlib.file_digest(incoming, "sha256").hexdigest()
                if not target.is_file() or sha(target) != digest:
                    raise ValueError("Existing media differs; preserved: " + member.name)
        for member in members:
            target = destination / member.name
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
            elif not target.exists():
                target.parent.mkdir(parents=True, exist_ok=True)
                with stream.extractfile(member) as incoming, target.open("xb") as output:
                    shutil.copyfileobj(incoming, output)
    print("Restored pinned web media without overwriting existing files")


def prepare_docs():
    navigation = json.loads((SITE / "src/docsNavigation.json").read_text())
    staging = OUTPUT / "docs"
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir(parents=True, exist_ok=True)
    known = {str((ROOT / "docs" / (row["id"] + ".md")).resolve()): row["id"] for row in navigation}
    repository = CONFIG["repository_url"] + "/blob/main/"

    for row in navigation:
        source = ROOT / "docs" / (row["id"] + ".md")

        def link(match, source=source, row=row):
            label, url = match.group(1), match.group(2)
            if re.match(r"^(?:https?:|mailto:|#)", url):
                return match.group(0)
            parsed = urllib.parse.urlsplit(url)
            target = (source.parent / urllib.parse.unquote(parsed.path)).resolve()
            # Python-Markdown collapses the doubled hyphens used by the legacy
            # React portal around an em dash. Adapt only the staged link.
            fragment = "#" + re.sub(r"-{2,}", "-", parsed.fragment) if parsed.fragment else ""
            if str(target) in known:
                relative = os.path.relpath(staging / (known[str(target)] + ".md"), (staging / row["id"]).parent)
                return f"{label}({relative}{fragment})"
            if target.is_file() and target.suffix.lower() in {".png", ".jpg", ".jpeg", ".svg", ".gif"}:
                name = sha(target)[:16] + target.suffix
                asset = staging / "assets/references" / name
                asset.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(target, asset)
                relative = os.path.relpath(asset, (staging / row["id"]).parent)
                return f"{label}({relative}{fragment})"
            if target.is_relative_to(ROOT):
                relative_path = target.relative_to(ROOT).as_posix()
                if relative_path.startswith(("research/", "benchmarks/", "checkpoints/", "paper/")):
                    owner = CONFIG["media_repository_url"] if relative_path.startswith("paper/") else CONFIG["repository_url"]
                    bundle = "evidence" if relative_path.startswith("paper/") else "runtime"
                    return f"{label}({owner}/blob/main/assets/wasserman-{bundle}-v0.1.0.tar.gz)"
                owner = CONFIG["media_repository_url"] if relative_path.startswith(("docs/", "website/", "assets/")) else CONFIG["repository_url"]
                return f"{label}({owner}/blob/main/{relative_path}{fragment})"
            raise ValueError("Documentation link escapes the repository: " + url)

        content = re.sub(r"(!?\[[^\]]*\])\(([^)]+)\)", link, source.read_text())

        # HTML image/link attributes are used by a few historical evidence pages.
        def html_link(match, link=link):
            synthetic = re.match(r"(!?\[[^\]]*\])\(([^)]+)\)", "[asset](" + match[2] + ")")
            adapted = link(synthetic).removeprefix("[asset](")[:-1]
            return f'{match[1]}="{adapted}"'

        content = presentation_copy(re.sub(r'(src|href)="(?!https?:|#)([^"]+)"', html_link, content))
        target = staging / (row["id"] + ".md")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content)
    logo = staging / "assets/wasserman-logo.png"
    logo.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SITE / "public/static/wasserman-logo.png", logo)
    shutil.copyfile(SITE / "public/static/wasserman-logo-dark.svg", staging / "assets/wasserman-logo-dark.svg")
    stylesheet = staging / "assets/extra.css"
    fonts = staging / "assets/fonts"
    shutil.copytree(SITE / "src/assets/fonts", fonts)
    stylesheet.write_text(
        '@font-face { font-family: Manrope; src: url("fonts/manrope-latin.woff2") format("woff2"); '
        "font-weight: 200 800; font-display: swap; }\n"
        '@font-face { font-family: "DM Mono"; src: url("fonts/dm-mono-400-latin.woff2") format("woff2"); '
        "font-weight: 400; font-display: swap; }\n"
        ":root { --md-primary-fg-color: #163e70; --md-accent-fg-color: #1686d9; "
        "--md-default-fg-color: #20384c; --md-default-fg-color--light: #20384c; "
        "--md-default-fg-color--lighter: #20384c; --md-code-fg-color: #20384c; "
        "--md-code-hl-comment-color: #20384c; "
        '--md-text-font: Manrope, Arial, sans-serif; --md-code-font: "DM Mono", monospace; }\n'
        'html[data-theme="dark"] body { '
        "--md-default-bg-color: #081a28; --md-default-fg-color: #edf7ff; "
        "--md-default-fg-color--light: #edf7ff; --md-default-fg-color--lighter: #edf7ff; "
        "--md-code-bg-color: #183448; --md-code-fg-color: #edf7ff; "
        "--md-code-hl-comment-color: #edf7ff; --md-code-hl-name-color: #edf7ff; "
        "--md-typeset-color: #edf7ff; --md-typeset-a-color: #69c5ff; "
        "--md-accent-fg-color: #69c5ff; }\n"
    )
    groups = {}
    for row in navigation:
        groups.setdefault(row["group"], []).append({row["title"]: row["id"] + ".md"})
    config = {
        "site_name": "WasserMan documentation",
        "site_description": CONFIG["title"],
        "site_url": CONFIG["site_url"] + "docs/",
        "docs_dir": ".publication/docs",
        "site_dir": "dist/docs",
        "theme": {
            "name": "material",
            "logo": "assets/wasserman-logo.png",
            "favicon": "assets/wasserman-logo.png",
            "font": False,
            "palette": [
                {"scheme": "default", "toggle": {"icon": "material/weather-night", "name": "Switch to dark theme"}},
                {"scheme": "slate", "toggle": {"icon": "material/weather-sunny", "name": "Switch to light theme"}},
            ],
            "features": ["navigation.sections", "navigation.path", "content.code.copy", "search.highlight"],
        },
        "nav": [{"Project website": CONFIG["site_url"]}] + [{group: pages} for group, pages in groups.items()],
        "markdown_extensions": [
            "admonition",
            "attr_list",
            "md_in_html",
            "pymdownx.details",
            "pymdownx.superfences",
            "tables",
            {"toc": {"permalink": True}},
        ],
        "extra_css": ["assets/extra.css"],
    }
    (SITE / "mkdocs.yml").write_text(json.dumps(config, indent=2) + "\n")
    print(f"Prepared {len(navigation)} static guides from the authoritative docs/ sources")


def finalize():
    dist = SITE / "dist"
    index = dist / "index.html"
    content = index.read_text()
    for key, value in {
        "SITE_URL": CONFIG["site_url"],
        "SITE_TITLE": CONFIG["title"],
        "REPOSITORY_URL": CONFIG["repository_url"],
        "VERSION": CONFIG["version"],
    }.items():
        content = content.replace("__" + key + "__", html.escape(value, quote=True))
    index.write_text(content)
    # Use the same early theme initialization on every static guide.
    for guide in (dist / "docs").rglob("*.html"):
        relative = os.path.relpath(dist / "theme-init.js", guide.parent)
        document = guide.read_text()
        script = f'<script src="{relative}"></script>'
        if script not in document:
            guide.write_text(document.replace("<head>", "<head>" + script, 1))
    (dist / ".nojekyll").touch()
    (dist / "robots.txt").write_text("User-agent: *\nAllow: /\nSitemap: " + CONFIG["site_url"] + "sitemap.xml\n")
    navigation = json.loads((SITE / "src/docsNavigation.json").read_text())
    urls = [CONFIG["site_url"]] + [
        CONFIG["site_url"] + "docs/" + ("" if row["id"] == "index" else row["id"] + "/") for row in navigation
    ]
    (dist / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        + "".join("<url><loc>" + html.escape(url) + "</loc></url>" for url in urls)
        + "</urlset>\n"
    )
    manifest = OUTPUT / "media-manifest.json"
    if manifest.exists():
        shutil.copyfile(manifest, dist / "media-manifest.json")
    sizes = [p.stat().st_size for p in dist.rglob("*") if p.is_file()]
    if sum(sizes) >= 950_000_000:
        raise ValueError(f"Pages budget exceeded: {sum(sizes)} bytes; limit 950 MB")
    if any(p.is_symlink() for p in dist.rglob("*")):
        raise ValueError("Pages artifact contains symbolic links")
    print(json.dumps({"pages_bytes": sum(sizes), "files": len(sizes), "scope": "Complete public static site"}))


def stage_pages():
    """Place the project below its canonical path in the account Pages site."""
    pages = OUTPUT / "pages"
    prefix = urllib.parse.urlparse(CONFIG["site_url"]).path.strip("/")
    if not prefix:
        raise ValueError("The account site requires a project path")
    target = safe_path(pages, prefix)
    if pages.exists():
        shutil.rmtree(pages)
    shutil.copytree(SITE / "dist", target)
    (pages / ".nojekyll").touch()
    shutil.copyfile(target / "robots.txt", pages / "robots.txt")
    url = html.escape(CONFIG["site_url"], quote=True)
    redirect = html.escape("./" + prefix + "/", quote=True)
    (pages / "index.html").write_text(
        '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<title>WasserMan</title><link rel="canonical" href="' + url + '">'
        '<meta http-equiv="refresh" content="0;url=' + redirect + '"></head>'
        '<body><a href="' + redirect + '">WasserMan</a></body></html>\n'
    )
    print("Prepared account Pages artifact at", pages, "with project path /" + prefix + "/")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=["media", "restore-media", "docs", "finalize", "pages"])
    parser.add_argument("--ffmpeg", default="ffmpeg")
    parser.add_argument("--workers", type=int, default=2)
    parser.add_argument("--archive", type=Path)
    args = parser.parse_args()
    if args.operation == "media":
        prepare_media(args.ffmpeg, args.workers)
    elif args.operation == "restore-media":
        if args.archive is None:
            parser.error("restore-media requires --archive")
        restore_media(args.archive)
    elif args.operation == "docs":
        prepare_docs()
    elif args.operation == "pages":
        stage_pages()
    else:
        finalize()


if __name__ == "__main__":
    main()
