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
| FE-010 | Mobil resultatinventering | DONE | Resultatdatabasen visas som läsbara kort under 600 px med paginering och åtkomliga åtgärder |
| SEC-001 | HTML-escaping och exportkontroll | DONE | Externa textfält HTML-escapas och råarkivet ligger utanför webbutdata |
| QA-001 | Riktig Chromium browser-QA vid 1440/900/768/390 | DONE | GitHub Actions-körning `37932828615` på exact head `66f0b60` lyckades och laddade upp skärmbildsartefakt; viewportflödena är verifierade i tidigare visuell granskning |
| QA-003 | GitHub Actions exact-head QA och artefakter | DONE | `37937098006` byggde data, passerade käll-/databas-/semantik-/GPX-geometri-/preview- och Chromium-QA på `82dad5e` och rapporterade en artefakt |
| QA-002 | Uppdatera PROJECT_STATE, commit och push | DONE | Projektstatus och arbetskö uppdateras tillsammans med verifierad korrigeringscommit |
| QA-004 | Visuell granskning av Actions-skärmbilder | DONE | Artefakten innehåller `desktop-1440.png`, `desktop-900-map-duel.png`, `responsive-768.png` och `responsive-390.png`; samtliga granskade |
| DATA-005 | Officiell 2026-könsproveniens | DONE | PDF-importen ger 110/110 könsvärden: 22 Kvinnor och 88 Män, med `result-2026-gender` som källa |
| SRC-001 | Historiska GPX och 2025 alternativkälla | BLOCKED | Kräver autentisk källa eller dokumenterat verifierat hinder |

## GPX- och kartanalys

| ID | Uppgift | Status | Verifierbart acceptanskriterium |
|---|---|---|---|
| GPX-001 | Auditera befintliga rå-GPX | DONE | `tests/test_gpx.js` passerar; fem filer har hash, punktantal, distans, höjd- och tidsproveniens i `data/gpx-audit.json` |
| GPX-002 | Identifiera publika kandidater 2014–2026 | DONE | `GPX_COVERAGE.md` listar Plotaroute-, Trace de Trail-, AllTrails- och Garmin-kandidater samt åtkomsthinder |
| GPX-003 | Spatial kontroll vid Knäbäckshusen | DONE | `scripts/compare_gpx.js 5000` ger reproducerbara lokala avvikelsemått; resultatet behandlas som diagnostik, inte officiell banverifiering |
| GPX-004 | Fastställa officiell/publicerbar årsgeometri | BLOCKED | Kräver arrangörens eller upphovspersonens uttryckliga rättighet och årsanknytning |
| GPX-005 | Korrigerad punkt-till-linjesegment-jämförelse | DONE | `scripts/gpx_geometry.js` projicerar, resamplar 25 m, hanterar `<trkseg>`/hopp och redovisar median/P95/max samt tröskelandelar; regressionstest passerar |
| MAP-001 | Lokal interaktiv GPX-karta och höjdprofil | DONE | `node scripts/serve_gpx_preview.js` visar fem lokala spår, färgval, flerårigt urval, Knäbäckshusen-zoom, avvikelsemarkeringar och separata höjdprofiler |
| MAP-002 | Publik verifierad bangeometri | BLOCKED | Kräver minst en officiell/publicerbar årsgeometri och klarlagda rättigheter |
| MAP-003 | Mellantidsankrad positionsrekonstruktion | BLOCKED | Kräver verifierade checkpoint-koordinater och jämförbara kronologiska mellantider |
| MAP-004 | GPS-replay från deltagarpositioner | BLOCKED | Ban-GPX är inte tidsstämplad löparaktivitet; kräver autentisk positionshistorik och tillstånd |
