#!/usr/bin/env python3
"""Restore GAX100 inputs from a private checkout without logging identities."""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_URLS = {
    "result-index-2026": "https://gax100.se/resultat/",
    "result-2026-gender": "https://gax100.se/wp-content/uploads/2026/07/Resultat-till-hemsidan.pdf",
    "result-2014": "https://gax100.se/resultat/resultat-2014/",
    "result-2015": "https://gax100.se/resultat/resultat-2015/",
    "result-2016": "https://gax100.se/resultat/resultat-2016/",
    "result-2017": "https://gax100.se/resultat/resultat-2017/",
    "result-2018": "https://gax100.se/resultat/resultat-2018/",
    "result-2019": "https://gax100.se/resultat/resultat-2019/",
    "result-2020": "https://gax100.se/resultat/resultat-2020/",
    "result-2021": "https://gax100.se/resultat/resultat-2021/",
    "result-2022": "https://gax100.se/resultat/resultat-2022/",
    "result-2023": "https://gax100.se/resultat/resultat-2023/",
    "result-2024": "https://gax100.se/resultat/resultat-2024/",
    "result-2025": "https://gax100.se/wp-content/uploads/2025/07/GAX-Resultat-2025.pdf",
    "course-current": "https://gax100.se/bana-karta/",
    "pm-2023": "https://gax100.se/wp-content/uploads/2024/03/GaxPM2023.pdf",
}


def digest(path: Path) -> tuple[int, str]:
    checksum = hashlib.sha256()
    size = 0
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            size += len(chunk)
            checksum.update(chunk)
    return size, checksum.hexdigest()


def destination(relative: str) -> Path:
    prefix = "source/"
    if not relative.startswith(prefix):
        raise SystemExit("Private manifest contains an unapproved GAX100 path")
    target = Path(relative.removeprefix(prefix))
    approved = (
        target == Path("data/verified/result-2025-official.json")
        or (
            len(target.parts) == 4
            and target.parts[:2] == ("data", "raw")
            and target.parts[2] in {"html", "pdf"}
            and target.suffix.lower() in {".html", ".pdf"}
        )
    )
    if not approved or target.is_absolute() or ".." in target.parts:
        raise SystemExit("Private manifest contains an unapproved GAX100 path")
    return ROOT / target


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--private-root", required=True, type=Path)
    args = parser.parse_args()
    project = args.private_root.resolve() / "gax100"
    manifest_path = project / "SOURCE_MANIFEST.json"
    if not manifest_path.is_file():
        raise SystemExit("Private GAX100 source manifest is unavailable")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    files = manifest.get("files")
    if not isinstance(files, list) or len(files) != 17:
        raise SystemExit("Private GAX100 source manifest is invalid")

    restored = 0
    runtime_manifest = []
    for entry in files:
        relative = entry.get("path")
        if not isinstance(relative, str):
            raise SystemExit("Private GAX100 source manifest is invalid")
        source = project / relative
        expected = (entry.get("bytes"), entry.get("sha256"))
        if not source.is_file() or digest(source) != expected:
            raise SystemExit("A private GAX100 source failed integrity verification")
        target = destination(relative)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        if digest(target) != expected:
            raise SystemExit("A restored GAX100 source failed verification")
        restored += 1

        if target.parent.name in {"html", "pdf"}:
            source_id = target.stem
            if source_id not in SOURCE_URLS:
                raise SystemExit("A private GAX100 source lacks approved provenance")
            runtime_manifest.append(
                {
                    "id": source_id,
                    "url": SOURCE_URLS[source_id],
                    "kind": target.suffix.removeprefix("."),
                    "path": str(target.resolve()),
                    "fetched_at": None,
                    "status": "downloaded",
                    "sha256": expected[1],
                    "error": None,
                }
            )

    if len(runtime_manifest) != 16 or set(SOURCE_URLS) != {x["id"] for x in runtime_manifest}:
        raise SystemExit("The private GAX100 source set is incomplete")
    by_id = {item["id"]: item for item in runtime_manifest}
    runtime_manifest = [by_id[source_id] for source_id in SOURCE_URLS]
    raw_manifest = ROOT / "data" / "raw" / "MANIFEST.json"
    raw_manifest.write_text(json.dumps(runtime_manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Private GAX100 sources restored and verified: {restored}")


if __name__ == "__main__":
    main()
