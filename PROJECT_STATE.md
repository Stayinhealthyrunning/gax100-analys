# Projektstatus: GAX100 Analys

## Aktuellt

ETAPP 1 är mergad till `main` via PR #1 (merge commit `8a11f78`). ETAPP 2 körs på branchen `codex/gax100-etapp2` och Draft PR #2. Resultatimport, databasvalidering och en testbar frontendgrund är implementerade enligt Loppanalys Standard 1.0.

## Genomfört

- `1900a94` verifierar vanlig filskrivning och Git-commit.
- Branchen finns på GitHub och följer `origin/codex/gax100-etapp2`.
- Officiella webbkällor för resultat, bana/karta och historiska resultat är identifierade.
- 2026 års arrangörslänkade Garmin-kurs är identifierad: `https://connect.garmin.com/app/course/484861455`.
- Arrangören anger att sträckan förbi Knäbäckshusen är ny från 2024 efter stormen Babet; detta är en prioriterad historisk banversion att dokumentera.
- Dokumentationsramen för ETAPP 1 är skapad.
- Standardfilen `LOPPANALYS_STANDARD_V1_0.md` är fullständigt läst via GitHub-klon.
- `DATA_COVERAGE.md` innehåller editionsmatris 2014–2026, åtkomsthinder, GPX-läge och genomförbarhetsbedömning.
- 2021 är identifierat som två verkliga upplagor; 2024 års Knäbäckshusen-ändring är källverifierad textuellt.
- `scripts/fetch_sources.ps1` har hämtat 13 HTML-källor, officiell 2026-resultat-PDF och `GaxPM2023.pdf` lokalt till ignorerat `data/raw/`; manifestet innehåller 16 poster, 15 nedladdade poster, URL, status, tidpunkt och SHA-256.
- 2025 års resultat-URL svarar med HTTP 404; hindret är dokumenterat och inte återförsökt upprepade gånger.
- `scripts/audit_sources.ps1` kördes och skapade `data/source-audit.json`; detta är en teknisk regex-audit, inte normaliserade resultatantal.
- `tests/test_source_pipeline.ps1` passerar: manifestet innehåller 16 poster, varav 15 nedladdade; 2025 är den enda konstaterade HTTP 404-posten och auditens begränsningsmarkeringar finns för nedladdade källor.
- `scripts/build_database.js` bygger SQLite från råarkivet; två körningar i följd är idempotenta.
- `tests/test_database.js` passerar: 13 editions, 826 resultat, 1 838 observationer; FINISHED 582, DNF 139, UNKNOWN 105, DNS 0. Verifierat startantal är nu modellerat för 2015 (53), 2021-A (38), 2023 (89) och 2024 (87); övriga upplagor visas som ej fastställda. Äldre tidsformat reparerades efter faktisk kronologigranskning och explicit `DNF(...)`-råtext klassificeras nu källtroget.
- ETAPP 3-grunden finns i `web/`: årsväljare, fem faktakort, löparsökning, resultattabell och individuell mellantidsvy från exporterad normaliserad data.
- `scripts/export_web_data.js` exporterade 13 editions, 826 resultat och 1 838 observationer till `web/data.json`; JavaScript-syntaxkontroller passerar.
- `tests/test_statistics.js`, `tests/test_time_parser.js`, `tests/test_time_format.js`, `tests/test_gender_2026.js`, `tests/test_semantics.js` och `tests/test_web.js` passerar. Median för jämnt n använder de två mittersta värdena; percentiler använder linjär interpolation `h=(n−1)×p`; alla presenterade tider rundas till hela sekunder. 2026 års officiella PDF ger verifierat kön för 110/110 resultat (22 Kvinnor, 88 Män) med separat källproveniens. Frontend har nu paginerad mobil resultdatabas med åtkomliga åtgärder, kontrollerad responsiv kortpresentation, förbättrad overflow-QA, tomläge för saknade diagramunderlag och startantal där officiell text fastställer dem.
- `.github/workflows/qa.yml`, `playwright.config.js`, `package.json` och `tests/e2e/gax100.spec.js` etablerar riktig Chromium browser-QA med screenshots, trace/video vid fel och artefaktuppladdning. GitHub Actions-körning `37927602400` på `e362a22` godkände alla fyra viewportflöden och producerade artefakten `gax100-playwright-qa-e362a229435c7827e76f22e49ee539db2b84d35c`. Skärmbilderna för 1440, 900, 768 och 390 px är visuellt granskade. Lokal npm saknas fortfarande i Codex-miljön.

## Nästa steg

1. Fortsätt från den verifierade korrigeringscommitten på `codex/gax100-etapp2`; Draft PR #2 ska förbli öppen och inte mergas.
2. Hitta verifierad historisk GPX/2025-alternativkälla; annars behåll blockeringarna.
3. Implementera endast ytterligare analysblock där verifierat underlag och standardkontrakt räcker.

## Begränsningar

Råarkivet och SQLite-databasen är lokalt reproducerbara men råfiler/SQLite publiceras inte. Officiella resultatsidor är heterogena. Ingen verifierad, redistribuerbar GPX-årsfil är tillgänglig; geometrisk flerårsjämförelse och replay saknar därför underlag. 2025 saknar fortfarande importerbar detaljkälla efter dokumenterad HTTP 404. Lokal Playwright-körning är inte möjlig eftersom npm saknas i Codex-miljön; GitHub Actions används för riktig browser-QA.
