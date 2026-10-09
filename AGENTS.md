# AGENTS.md

## Projekt

GAX100 Analys är ett källspårbart analysunderlag för The GAX 100 Miles. Arbetet ska följa Loppanalys Standard 1.0 och skilja verifierade uppgifter från antaganden.

## Arbetsregler

- Använd officiella GAX-källor i första hand och registrera varje källa i `SOURCE_REGISTER.md`.
- Ändra inte historiska resultat utan källa och ange luckor explicit.
- Mellantider, GPX-filer och historiska banversioner ska behandlas som separata datamängder med årtal och versionsstatus.
- Uppdatera `PROJECT_STATE.md` före varje sessionsavslut.
- Gör små, beskrivande commits och pusha färdiga delresultat till arbetsbranchen.

## Status

ETAPP 1 är mergad till `main`. ETAPP 2 körs på `codex/gax100-etapp2`; resultatimport, korrigerad tids-/statusnormalisering, verifierad 2026-könskälla, standardiserad statistik, en testbar webbfunktion och reproducerbar GPX-audit är implementerade. Fem lokala GPX-spår är geometriskt analyserade men ingen är publiceringsklar eller officiellt årsverifierad. Chromium browser-QA körs i GitHub Actions; lokal npm/Playwright-körning saknas eftersom npm inte finns i Codex-miljön.
