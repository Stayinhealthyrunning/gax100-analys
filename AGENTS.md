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

ETAPP 1 är mergad till `main`. Aktuell integrationskandidat är `codex/gax100-final-integration-2026-10-14`, byggd på Draft PR #6 som redan innehåller #5. Tidigare ETAPP 2- och audit-PR:er är separata och får inte dubbelmergas. Källorna återläses hashverifierat från privat repo och offentlig export kräver privat GDPR-register. Se `reports/GAX100_FINAL_INTEGRATION_QA.md` och `PROJECT_STATE.md`. Fem lokala GPX-kandidater är analyserade men ingen är officiellt årsverifierad och publiceringsklar. Chromium-QA körs i GitHub Actions; lokal Playwright-installation saknas.
