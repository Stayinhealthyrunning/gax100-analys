# GAX100 integration-branch cleanup risk — 2026-10

Inventory target: active integration head `c5cda2795edc223e332cf380d327978057e56028`
(`integration/gax100-gdpr-v2-and-ux-2026-10-13`). The nine-file `main` count is
not representative of this product; this branch contains 82 tracked files.

## Classification

| candidate group | class | evidence | action |
|---|---|---|---|
| `web/data.json`, `web/*.js`, `web/index.html`, `web/karta.html` | D | public snapshot, browser tests and export contract consume these exact paths | retain |
| `data/verified/result-2025-official.json` and `data/curated/*` | B/D | verified source-scoped fixture and curated build inputs; privacy/source tests depend on them | retain; never publish raw replacements |
| `scripts/public_privacy.js`, `scripts/verify_source_integrity.js`, privacy tests and registry contract | B/D | fail-closed GDPR/public-export gate; missing registry must stop publication | retain unchanged |
| `scripts/fetch_sources.ps1`, `audit_sources.ps1`, `build_database.js`, `export_web_data.js` | D/E | source/import/export pipeline; live source restore and rights checks are unresolved | retain pending maintainer/rightholder decision |
| `tests/` unit and e2e suites | D | QA and release evidence for the active Draft PR chain | retain |
| `reports/*AUDIT*`, `PROJECT_STATE.md`, `RELEASE_READINESS.md`, `SOURCE_REGISTER.md` | D/E | active handoff, provenance and release gate evidence; age/name is not deletion proof | retain |
| `.github/workflows/qa.yml`, `snapshot-qa.yml` | B/D | source integrity, privacy, full QA and snapshot gates | retain and run at exact head |
| `local/gpx-preview/*`, `scripts/serve_gpx_preview.js` | E | browser-local/noindex preview is intentionally separate from public Pages; rights status remains open | retain until owner decides |

## Result

No class-A removal or class-C consolidation is proven safe on this active
integration branch. There are no byte-identical tracked file groups. The
remaining uncertainty is legal/source-rights and private-registry availability,
not demonstrable dead code. No merge, publication, secret change, source copy,
or product behavior change was made.

## Verification

The branch contains the existing source/data/semantic/privacy/web contracts and
snapshot QA workflow. Local export remains correctly fail-closed without the
private registry. Full source QA must continue in existing Actions with the
required private restore; this report must not be interpreted as release
approval.
