"""Website archive restoration preserves files and rejects unsafe packages."""

import hashlib
import importlib.util
import io
import json
import tarfile
from pathlib import Path

import pytest

spec = importlib.util.spec_from_file_location(
    "prepare_website", Path(__file__).parents[1] / "scripts/prepare_website.py"
)
website = importlib.util.module_from_spec(spec)
spec.loader.exec_module(website)


def package(tmp_path, monkeypatch, name="static/demo.json", content=b'{"complete":true}', link=False):
    archive = tmp_path / "media.tar.gz"
    with tarfile.open(archive, "w:gz") as stream:
        member = tarfile.TarInfo(name)
        if link:
            member.type = tarfile.SYMTYPE
            member.linkname = "../../outside"
            stream.addfile(member)
        else:
            member.size = len(content)
            stream.addfile(member, io.BytesIO(content))
    site = tmp_path / "website"
    site.mkdir()
    (site / "media-package.json").write_text(
        json.dumps({"bytes": archive.stat().st_size, "sha256": hashlib.sha256(archive.read_bytes()).hexdigest()})
    )
    monkeypatch.setattr(website, "SITE", site)
    return archive, site


def test_media_restoration_is_exact_and_idempotent(tmp_path, monkeypatch):
    archive, site = package(tmp_path, monkeypatch)
    website.restore_media(archive)
    website.restore_media(archive)
    assert (site / "public/static/demo.json").read_bytes() == b'{"complete":true}'


def test_existing_different_media_is_preserved(tmp_path, monkeypatch):
    archive, site = package(tmp_path, monkeypatch)
    target = site / "public/static/demo.json"
    target.parent.mkdir(parents=True)
    target.write_bytes(b"valuable existing bytes")
    with pytest.raises(ValueError, match="Existing media differs"):
        website.restore_media(archive)
    assert target.read_bytes() == b"valuable existing bytes"


@pytest.mark.parametrize("name", ["../escape", "/absolute"])
def test_escaping_archive_paths_are_rejected(tmp_path, monkeypatch, name):
    archive, site = package(tmp_path, monkeypatch, name=name)
    with pytest.raises(ValueError, match="Unsafe media archive path"):
        website.restore_media(archive)
    assert not list((site / "public").rglob("*"))


def test_links_are_rejected_before_extraction(tmp_path, monkeypatch):
    archive, _ = package(tmp_path, monkeypatch, link=True)
    with pytest.raises(ValueError, match="regular files, not links"):
        website.restore_media(archive)


def test_corrupt_media_archive_is_rejected(tmp_path, monkeypatch):
    archive, site = package(tmp_path, monkeypatch)
    archive.write_bytes(b"corrupt")
    with pytest.raises(ValueError, match="pinned digest"):
        website.restore_media(archive)
    assert not (site / "public").exists()


def test_media_manifest_does_not_include_itself_on_repeated_preparation(tmp_path, monkeypatch):
    site = tmp_path / "website"
    source = site / "public"
    source.mkdir(parents=True)
    (site / "src").mkdir()
    (site / "src/overviewVideo.json").write_text('{"src":"./static/publication/overview-v6/film.mp4"}')
    (source / "demo.json").write_text('{"complete":true}')
    (source / "media-manifest.json").write_text('{"stale":true}')
    monkeypatch.setattr(website, "SITE", site)
    monkeypatch.setattr(website, "OUTPUT", site / ".publication")
    website.prepare_media("unused-no-videos", 1)
    first = (site / ".publication/media-manifest.json").read_bytes()
    (source / "media-manifest.json").write_bytes(first)
    website.prepare_media("unused-no-videos", 1)
    assert (site / ".publication/media-manifest.json").read_bytes() == first
    assert set(json.loads(first)["files"]) == {"demo.json"}
