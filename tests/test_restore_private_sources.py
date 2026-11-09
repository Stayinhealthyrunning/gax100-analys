"""Synthetic private-source restore contract; no participant data is used."""
import hashlib
import importlib.util
import json
import sys
import tempfile
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "restore_private_sources.py"
spec = importlib.util.spec_from_file_location("restore_private_sources", SCRIPT)
restore = importlib.util.module_from_spec(spec)
spec.loader.exec_module(restore)


def fixture(private_root):
    project = private_root / "gax100"
    files = []
    for source_id, url in restore.SOURCE_URLS.items():
        suffix = "pdf" if url.endswith(".pdf") else "html"
        relative = f"source/data/raw/{suffix}/{source_id}.{suffix}"
        content = f"synthetic fixture for {source_id}\n".encode()
        source = project / relative
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_bytes(content)
        files.append({"path": relative, "bytes": len(content),
                      "sha256": hashlib.sha256(content).hexdigest()})
    relative = "source/data/verified/result-2025-official.json"
    content = b'{"rows":[]}\n'
    source = project / relative
    source.parent.mkdir(parents=True, exist_ok=True)
    source.write_bytes(content)
    files.append({"path": relative, "bytes": len(content),
                  "sha256": hashlib.sha256(content).hexdigest()})
    manifest = project / "SOURCE_MANIFEST.json"
    manifest.write_text(json.dumps({"files": files}), encoding="utf-8")
    return manifest, files


def run(public_root, private_root):
    restore.ROOT = public_root
    sys.argv = [str(SCRIPT), "--private-root", str(private_root)]
    restore.main()


with tempfile.TemporaryDirectory(prefix="gax-restore-contract-", dir=SCRIPT.parents[1] / "data" / "raw") as temporary:
    base = Path(temporary)
    private_root = base / "private"
    manifest, files = fixture(private_root)
    public_root = base / "valid-public"
    run(public_root, private_root)
    assert (public_root / "data/raw/MANIFEST.json").is_file()
    assert (public_root / "data/verified/result-2025-official.json").is_file()

    # An invalid final entry must fail before even the first private file is copied.
    files[-1]["sha256"] = "0" * 64
    manifest.write_text(json.dumps({"files": files}), encoding="utf-8")
    invalid_root = base / "invalid-public"
    try:
        run(invalid_root, private_root)
        raise AssertionError("Tampered source was accepted")
    except SystemExit as error:
        assert "integrity verification" in str(error)
    assert not (invalid_root / "data/raw").exists()
    assert not (invalid_root / "data/verified").exists()

    files[-1]["sha256"] = hashlib.sha256(b'{"rows":[]}\n').hexdigest()
    files[-1] = dict(files[0])
    manifest.write_text(json.dumps({"files": files}), encoding="utf-8")
    duplicate_root = base / "duplicate-public"
    try:
        run(duplicate_root, private_root)
        raise AssertionError("Duplicate private path was accepted")
    except SystemExit as error:
        assert "manifest is invalid" in str(error)
    assert not (duplicate_root / "data/raw").exists()

    try:
        restore.destination("source/../outside.json")
        raise AssertionError("Path traversal was accepted")
    except SystemExit as error:
        assert "unapproved" in str(error)

print("PASS: synthetic 17-file restore, tamper/duplicate/path-traversal fail closed")
