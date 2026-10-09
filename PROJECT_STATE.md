# Projektstatus: GAX100 Analys

## Aktuellt

ETAPP 2 körs på befintlig branch `codex/gax100-etapp2` och Draft PR #2. Senaste pushade head är `3e08e57` (`test: cover official 2025 edition and plan simulation`). PR:n är inte mergad och GAX100 är inte tillagd i huvudkatalogen.

## Senast verifierat

- ETAPP 1 är mergad till `main` via PR #1 (`8a11f78`). Den centrala `LOPPANALYS_STANDARD_V1_0.md` är fullständigt läst via GitHub-klon.
- Officiella resultatkällor, ban-/GPX-kandidater, åtkomsthinder och statusen identifierad/verifierad/nedladdad/normaliserad finns i `DATA_COVERAGE.md` och `SOURCE_REGISTER.md`.
- 2025 års officiella resultatindexlänk verifierades till PDF:en `https://gax100.se/wp-content/uploads/2025/07/GAX-Resultat-2025.pdf`. Importen bygger 119 publicerade rader: 69 FINISHED, 40 DNF och 10 DNS. Startantal modelleras som 109 (FINISHED + DNF). DNF/DNS utan entydig PDF-könsrubrik lämnas utan könsantagande. Den deterministiska transkriptionen finns i `data/verified/result-2025-official.json`; original-PDF:en ligger lokalt i ignorerat råarkiv.
- SQLite-exporten är nu 14 editions, 945 resultatposter och 1 838 observationer: FINISHED 651, DNF 179, DNS 10, UNKNOWN 105. `tests/test_database.js`, `tests/test_semantics.js`, `tests/test_web.js`, 2026-könstest, tids-/statistiktester och GPX-geometritest passerar.
- Fem lokala GPX-filer är tekniskt auditerade i det ignorerade råarkivet. `scripts/gpx_geometry.js` använder metrisk projektion, 25 m resampling, punkt-till-linjesegment-avstånd, median/P95/max, tröskelandeler och gap-safe `<trkseg>`-hantering. Ingen kandidat är klassad som officiell redistribuerbar årsfil.
- Lokal GPX-preview passerar med loopback-test och publicerar inte råfiler. `web/karta.html` är en noindex-förhandsvisning med Plotaroute-embeds och användarstyrd lokal GPX-filväljare; inga råfiler eller härledda GAX-koordinater ligger i webbutdata.
- Frontend har fem faktakort, mobil resultatinventering med paginering, kvalitetstabell per upplaga, ärliga diagramtomlägen, relativ segmentfart med 100 %-referens, jämförelse endast av kompatibla kontrollpunkter samt personlig historisk referens med separat proportionell måltidssimulering.
- GitHub Actions körning `37952354460` på `7757cf1` och slutlig körning `37952863584` på exakt head `3e08e57` passerade. Den slutliga körningen täcker källpipeline, SQLite, semantik, GPX, Chromium och screenshots. Artefakten granskades visuellt vid 1440, 900, 768 och 390 px; ingen horisontell overflow, kapad mobilresultatvy eller uppenbart layoutfel kvarstod.
- Den slutliga E2E-sviten verifierar båda 2021-upplagorna, 2025 års statusimport, sökning, klubbfilter, sortering, resultatval, individuell analys, jämförelse, plan-simulering, Kartduellens 2–5-begränsning, GPX-gating, karta och mobilpaginering.

## Nästa steg

1. Fortsätt från `3e08e57` på `codex/gax100-etapp2`; behåll Draft PR #2 öppen och merga inte.
2. Begär arrangörens uttryckliga tillstånd och årsanknytning för 2023/2024/2026-GPX innan råspår eller härledd geometri publiceras.
3. Fortsätt separera capability-gating: verifierad bangeometri, höjdprofil, banjämförelse, mellantidsankrad position och tidsstämplad löparreplay.
4. Kör nya ändringar genom GitHub Actions och uppdatera denna fil före varje avslut.

## Begränsningar

Ingen officiell, redistribuerbar historisk GPX-årsfil eller verifierad checkpoint-koordinatserie finns ännu. Ban-GPX-filerna är inte tidsstämplade löparpositioner; Kartduellens valkontrakt och källkartor kan visas, men replay och mellantidsankrad positionsrekonstruktion är fortsatt gated. 2026 Garmin-kurs är visuellt verifierad som 161,45 km/697 hm men fristående GPX-export kunde inte arkiveras. Lokal npm/Playwright-körning saknas i Codex-miljön; riktig browser-QA körs därför i GitHub Actions.
