# WORK_QUEUE.md

## Färdigställandekörning

| ID | Uppgift | Status | Verifierbart acceptanskriterium |
|---|---|---|---|
| DATA-001 | Semantisk datavalidering per edition och status | DONE | `tests/test_semantics.js` passerar för 13 editions |
| DATA-002 | Dokumentera uppmätt datatäckning | DONE | `DATA_COVERAGE.md` och `data/IMPORT_REPORT.md` innehåller testade counts |
| DATA-003 | Korrigera äldre tidsformat och statusklassificering | DONE | Gemensam tidsparser testas; 4:51(31), punkt/komma/semikolon och h/m hanteras utan rangförorening; explicit DNF-råtext blir DNF |
| DATA-004 | Verifiera passagetidernas kronologi | DONE | Semantiktestet stoppar negativa eller fallande ackumulerade tider |
| STAT-001 | Korrekt median vid jämnt antal | DONE | Statistiktest verifierar medianen 2,5 för [1,2,3,4] |
| STAT-002 | Enhetlig linjär percentilmetod | DONE | Statistiktest verifierar h=(n−1)×p och UI visar P10/P25/P50/P75/P90 |
| FE-001 | Fem faktakort och korrekt editionsval | DONE | År/edition byter statistik utan fabricerat startantal |
| FE-002 | Sökning, klubbfilter och sorterbar tabell | DONE | `tests/test_web.js` passerar DOM-sektioner och export |
| FE-003 | Sluttidsfördelning, percentiler och placering mot tid | DONE | Histogram, P10/P50/P90 och tid/placering finns |
| FE-004 | Individuell analys med faktiska segmenttider | DONE | Endast importerade observationer visas; saknade värden gated |
| FE-005 | Direktjämförelse 2.0, exakt två resultat | DONE | Exakt två val jämför gemensamma importerade kontrollpunkter utan GPS-antaganden |
| FE-006 | Kartduell/replay capability-gating | BLOCKED | GPX-geometri saknas; replay får inte aktiveras |
| FE-007 | Personlig loppplan capability-gating | DONE | Planmodulen är synlig men gated tills tillräckligt historiskt underlag finns |
| FE-008 | Historisk jämförelse mellan upplagor | DONE | Historiktabell visar verifierade FINISHED, DNF, tider och observationer per upplaga |
| FE-009 | Kartduellens valkontrakt 2–5 resultat | DONE | UI begränsar valet till 2–5 och visar tydlig GPX-gating |
| SEC-001 | HTML-escaping och exportkontroll | DONE | Externa textfält HTML-escapas och råarkivet ligger utanför webbutdata |
| QA-001 | Riktig Chromium browser-QA vid 1440/900/768/390 | DONE | GitHub Actions körde Playwright-flöden för 1440/900/768/390; screenshots, trace/video vid fel och rapportartefakt är konfigurerade |
| QA-003 | GitHub Actions exact-head QA och artefakter | DONE | Körningen på `cb130e4` byggde data, passerade käll-/databas-/semantiktester och Chromium-QA samt laddade upp rapportartefakter |
| QA-002 | Uppdatera PROJECT_STATE, commit och push | DONE | Projektstatus uppdateras i denna commit |
| SRC-001 | Historiska GPX och 2025 alternativkälla | BLOCKED | Kräver autentisk källa eller dokumenterat verifierat hinder |
