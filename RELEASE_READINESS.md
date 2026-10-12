# GAX100 Analys – release readiness

Status: release candidate under review. Branch `codex/gax100-etapp2`, Draft PR #2. Merge and catalog publication remain explicitly blocked pending maintainer approval.

## 1. Klart i denna kandidat

- 14 editions (2014–2026, including 2021-A/B), 945 result rows and 1 838 split observations are imported and tested.
- 2025 is imported from the official PDF as 69 FINISHED, 40 DNF and 10 DNS; the tracked fixture is a source-scoped transcription.
- 2026 gender provenance is tested: 22 `Kvinnor` and 88 `Män`; 44 rows remain `UNKNOWN` where finish/status is not established.
- Median, linear percentile interpolation and whole-second presentation are covered by regression tests.
- Result search, club/gender filters, sorting, 10-row pagination, mobile cards, result selection, favorites and share state are implemented.
- Individual analysis has gap-safe chronological segments, selectable segment rows and a relative-speed chart with a 100% reference.
- Direct comparison uses exactly two results and only common checkpoint IDs with equal verified source distance.
- Personal plan uses at least five same-edition FINISHED results, cohort segment fractions and largest-remainder exact-sum allocation. It is explicitly labelled mathematical simulation, not a forecast.
- Local GPX preview, route comparison and elevation profiles remain separate from public participant replay.
- Public privacy scan excludes raw archives, SQLite, raw JSON, dynamic code and unintegrity-checked Leaflet assets.

## 2. Begränsade funktioner och verifierade dataluckor

- No public, rights-cleared official historical GPX for 2023–2026 has been archived. The 2026 Garmin course is visually verified (161.45 km / 697 m) but its tested export endpoints returned `{}`.
- No verified checkpoint-coordinate series, participant timestamped GPS or stable placement-at-checkpoint observation exists. Public route geometry, replay and split-anchored position reconstruction therefore remain gated.
- Age, classes, placement journey, full segment lab, standouts, pacing retention and course-difficulty comparisons need additional source contracts.
- 2026 has 44 `UNKNOWN` rows and no imported split series. Missing values remain missing.

## 3. Kvarvarande defekter / risker

- The project cannot run npm/Playwright locally in the Codex environment; browser QA must be performed by GitHub Actions and its screenshots must be reviewed.
- The repository’s public Pages status endpoint is not readable anonymously (GitHub API returned HTTP 404 during this audit). The Pages workflow exists and has successful historical deployments, but the final candidate must be checked after its workflow-run deployment.
- Participant names and clubs are public source values. No GAX-specific anonymization request is present in the repository; a final maintainer check against external requests is still required.

## 4. Integritet, rättigheter och publiceringskontroll

- See `PRIVACY_REGISTER.md`, `SOURCE_REGISTER.md` and `GPX_COVERAGE.md`.
- Raw HTML/PDF/GPX files are ignored and are not copied into `web/`.
- The local map preview is `noindex`; user-selected GPX stays in the browser and no derived coordinates are exported.
- Leaflet is pinned with SRI. OpenStreetMap tiles are optional and the map remains usable with the local no-background mode.
- No new GPX geometry is to be published without explicit rights and year attribution.

## 5. Testresultat på slutlig commit

The final verification is complete for the commit named below. It includes Node contract tests, source/data/semantic tests, GPX tests, privacy scan, Chromium tests and screenshot artifact review at 1536, 1440, 1200, 1024, 900, 768, 390 and 360 px.

- Verified application head: **`3a04b49`**
- QA workflow: **`38214751968` – success** on exact application head
- Pages workflow: **`38214840161` – success**, triggered by the successful QA workflow; published URL verified at [loppanalys.se/gax100-analys](https://www.loppanalys.se/gax100-analys/)
- Visual screenshot review: **complete** for all eight requested widths; no real viewport overflow, clipped result cards or broken primary interaction was observed. The quality matrix remains intentionally scrollbarable on narrow screens.

## 6. Rekommendation om PR #2

**Draft PR #2 is conditionally ready for maintainer review, not auto-merge.** Exact-head QA and Pages deployment are green. Merge still requires the maintainer’s privacy/rightsholder decision, particularly for public GPX use, and explicit approval. No merge has been performed.

## 7. Rekommendation om länk från Loppanalys.se

**Do not link GAX100 from the Loppanalys.se catalogue yet.** The application is suitable for maintainer testing and the static Pages deployment is live, but official GPX rights, remaining data capabilities and the final catalog decision are still external release conditions.
