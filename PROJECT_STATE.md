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

## Nästa steg

1. ETAPP 2A: inventera hämtade HTML-tabeller och avgränsa båda 2021-upplagorna.
2. Avgränsa båda 2021-upplagorna och följ upp 2016/2020/2025:s åtkomsthinder.
3. Importera och normalisera först efter råarkiv och proveniens är på plats.
4. Beräkna inga analysmått före verifierad normalisering.
5. Uppdatera denna fil före sessionsslut.

## Begränsningar

Det finns inga tidigare analysfiler eller nedladdade rådata i repot. Officiella resultatsidor är heterogena och vissa kunde inte läsas i sessionen. Ingen GPX är nedladdad; geometrisk flerårsjämförelse och replay saknar därför underlag.
