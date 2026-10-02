"""Fetch only the pinned website media package; no model or dataset downloads."""

import argparse
import json
import os
from pathlib import Path

from fetch_paper_artifacts import asset_stream, assets_for_release, headers, write_checked

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--destination", type=Path, required=True)
    args = parser.parse_args()
    manifest = json.loads((ROOT / "website/media-package.json").read_text())
    publication = json.loads((ROOT / "website/publication.json").read_text())
    repository_api = publication.get("media_repository_url", publication["repository_url"]).replace("https://github.com/", "https://api.github.com/repos/")
    token = os.environ.get("GITHUB_TOKEN")
    authentication = {"User-Agent": "WasserMan-website-media"}
    if token:
        authentication["Authorization"] = "Bearer " + token
    else:
        authentication = headers()
    assets = assets_for_release(manifest["release_tag"], authentication, repository_api=repository_api)
    record = assets[manifest["name"]]
    if record["size"] != manifest["bytes"] or record.get("digest") != "sha256:" + manifest["sha256"]:
        raise ValueError("Remote media package differs from its pinned size or SHA256")
    write_checked(
        args.destination,
        manifest,
        lambda: iter([asset_stream(record["url"], authentication, repository_api=repository_api)]),
    )
    print("Verified website media package:", args.destination)


if __name__ == "__main__":
    main()
