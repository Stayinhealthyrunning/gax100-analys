# Projektstatus: GAX100 Analys

## Aktuellt

ETAPP 1 är mergad till `main` via PR #1 (merge commit `8a11f78`). ETAPP 2 körs på branchen `codex/gax100-etapp2` och Draft PR #2. Resultatimport, databasvalidering och en testbar frontendgrund är implementerade enligt Loppanalys Standard 1.0.

## Genomfört

- `1900a94` verifierar vanlig filskrivning och Git-commit.
- Branchen finns på GitHub och följer `origin/codex/gax100-etapp1`.
- Officiella webbkällor för resultat, bana/karta och historiska resultat är identifierade.
- 2026 års arrangörslänkade Garmin-kurs är identifierad: `https://connect.garmin.com/app/course/484861455`.
- Arrangören anger att sträckan förbi Knäbäckshusen är ny från 2024 efter stormen Babet; detta är en prioriterad historisk banversion att dokumentera.
- Dokumentationsramen för ETAPP 1 är skapad.
- Standardfilen `LOPPANALYS_STANDARD_V1_0.md` är fullständigt läst via GitHub-klon.
- `DATA_COVERAGE.md` innehåller editionsmatris 2014–2026, åtkomsthinder, GPX-läge och genomförbarhetsbedömning.
- 2021 är identifierat som två verkliga upplagor; 2024 års Knäbäckshusen-ändring är källverifierad textuellt.
- `scripts/fetch_sources.ps1` har hämtat 13 HTML-källor och `GaxPM2023.pdf` lokalt till ignorerat `data/raw/`; manifestet innehåller URL, status, tidpunkt och SHA-256.
- 2025 års resultat-URL svarar med HTTP 404; hindret är dokumenterat och inte återförsökt upprepade gånger.
- `scripts/audit_sources.ps1` kördes och skapade `data/source-audit.json`; detta är en teknisk regex-audit, inte normaliserade resultatantal.
- `tests/test_source_pipeline.ps1` passerar: manifest 15 poster, 14 nedladdade, audit 14 poster.
- `scripts/build_database.js` bygger SQLite från råarkivet; två körningar i följd är idempotenta.
- `tests/test_database.js` passerar: 13 editions, 826 resultat, 1 838 observationer; FINISHED 581, DNF 100, UNKNOWN 145, DNS 0.
- ETAPP 3-grunden finns i `web/`: årsväljare, fem faktakort, löparsökning, resultattabell och individuell mellantidsvy från exporterad normaliserad data.
- `scripts/export_web_data.js` exporterade 13 editions, 826 resultat och 1 838 observationer till `web/data.json`; JavaScript-syntaxkontroller passerar.
- `tests/test_semantics.js` och `tests/test_web.js` passerar. Frontend har klubbfilter, sortering, histogram, tid/placering, individuell delsträckevisning, exakt-två-jämförelse och gated Kartduell/personlig plan.

## Nästa steg

1. Senaste verifierade commit före denna körning är `821df9c`; uppdateras efter commit.
2. Lägg till percentilvy och full browser-QA om testmiljö blir tillgänglig.
3. Hitta verifierad historisk GPX/2025-alternativkälla; annars behåll blockeringarna.
4. Uppdatera denna fil före sessionsslut.

## Begränsningar

Det finns inga tidigare analysfiler eller nedladdade rådata i repot. Officiella resultatsidor är heterogena och vissa kunde inte läsas i sessionen. Ingen GPX är nedladdad; geometrisk flerårsjämförelse och replay saknar därför underlag.
