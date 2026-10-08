# WORK_QUEUE.md

## Färdigställandekörning

| ID | Uppgift | Status | Verifierbart acceptanskriterium |
|---|---|---|---|
| DATA-001 | Semantisk datavalidering per edition och status | DONE | `tests/test_semantics.js` passerar för 13 editions |
| DATA-002 | Dokumentera uppmätt datatäckning | DONE | `DATA_COVERAGE.md` och `data/IMPORT_REPORT.md` innehåller testade counts |
| FE-001 | Fem faktakort och korrekt editionsval | DONE | År/edition byter statistik utan fabricerat startantal |
| FE-002 | Sökning, klubbfilter och sorterbar tabell | DONE | `tests/test_web.js` passerar DOM-sektioner och export |
| FE-003 | Sluttidsfördelning, percentiler och placering mot tid | IN_PROGRESS | Histogram och tid/placering finns; percentilvy återstår |
| FE-004 | Individuell analys med faktiska segmenttider | DONE | Endast importerade observationer visas; saknade värden gated |
| FE-005 | Direktjämförelse 2.0, exakt två resultat | TODO | Gemensamma kontrollpunkter jämförs utan GPS-antaganden |
| FE-006 | Kartduell/replay capability-gating | BLOCKED | GPX-geometri saknas; replay får inte aktiveras |
| FE-007 | Personlig loppplan capability-gating | TODO | Plan visas endast när historiska mellantider stöder den |
| SEC-001 | HTML-escaping och exportkontroll | TODO | Externa textfält renderas som text och inga råfiler publiceras |
| QA-001 | DOM-/statisk QA vid 1440/900/768/390 | BLOCKED | Kräver browseråtkomst eller godkänd alternativ testmiljö |
| QA-002 | Uppdatera PROJECT_STATE, commit och push | DONE | Projektstatus uppdateras i denna commit |
| SRC-001 | Historiska GPX och 2025 alternativkälla | BLOCKED | Kräver autentisk källa eller dokumenterat verifierat hinder |
