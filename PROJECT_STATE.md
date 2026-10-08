# Projektstatus: GAX100 Analys

## Aktuellt

ETAPP 1 är mergad till `main` via PR #1 (merge commit `8a11f78`). ETAPP 2 körs på branchen `codex/gax100-etapp2`. Projektet ska bygga en källspårbar analys av The GAX 100 Miles enligt Loppanalys Standard 1.0; analysverktyget är ännu inte påbörjat.

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

## Nästa steg

1. Senaste verifierade commit är `b6086ce` på `codex/gax100-etapp2`.
2. ETAPP 2B är påbörjad: importerad databas och importtest fungerar.
3. Förbättra äldre format och köns-/statussemantik där källan stöder det; 2025 kvarstår som 404.
4. Fortsätt ETAPP 3 med browser-QA och capability-gating; lokal browser-QA blockerades av socketåtkomst (`ERR_CONNECTION_TIMED_OUT`/åtkomst nekad), inte av appens JavaScript.
5. Lägg till percentil-/fördelningsvyer först efter QA och behåll GPX/replay avstängt utan verifierade spår.
6. Uppdatera denna fil före sessionsslut.

## Begränsningar

Det finns inga tidigare analysfiler eller nedladdade rådata i repot. Officiella resultatsidor är heterogena och vissa kunde inte läsas i sessionen. Ingen GPX är nedladdad; geometrisk flerårsjämförelse och replay saknar därför underlag.
