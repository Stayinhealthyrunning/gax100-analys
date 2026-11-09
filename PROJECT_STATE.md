# Projektstatus: GAX100 Analys

## Aktuellt

ETAPP 2 körs på befintlig branch `codex/gax100-etapp2` och Draft PR #2. Senaste funktionella application head är `3a04b49` (`docs: link to central GDPR privacy policy and right to object`); därefter finns endast release-state-dokumentation på branchen. Använd `git log -1` för exakt aktuell branch-head. PR #2 är öppen, Draft och inte mergad. GAX100 är inte tillagd i huvudkatalogen.

## Senast verifierat

- Centrala `LOPPANALYS_STANDARD_V1_0.md` är fullständigt läst via GitHub-klon. `COMPONENT_MATRIX.md` jämför standardblockens datakontrakt, metod, interaktion, visuella utförande och teststatus mot Ultravasan, Gotaleden, ÖST och Sätila.
- Databasen har 14 editions, 945 resultatposter och 1 838 mellantidsobservationer: FINISHED 651, DNF 179, DNS 10, UNKNOWN 105. 2021-A och 2021-B är separata upplagor.
- 2025 är radvis transkriberat från arrangörens officiella PDF: 69 FINISHED, 40 DNF, 10 DNS och 109 fastställda startande (FINISHED + DNF). Kön sätts endast där PDF-rubrik stöder den.
- 2026 års könskälla ger 22 Kvinnor och 88 Män. 44 2026-rader saknar verifierad status/sluttid och ligger kvar som UNKNOWN.
- Medianen hanterar jämna n korrekt; percentiler använder linjär interpolation `h=(n−1)×p`; all presentation avrundas till hela sekunder utan decimaler.
- Individuell analys har gap-säker segmentering, valbar delsträcka och relativfartsdiagram. Direktjämförelse använder endast gemensamma kontrollpunkter med likvärdigt källavstånd. Personlig plan kräver minst fem FINISHED från samma upplaga och använder historiska segmentproportioner + största restmetod.
- Resultatdatabasen har namn/startnummer/klubbsökning, klubb- och könsfilter, sortering, 10-raders pagination, mobilkort, favorit och delningslänk. Utökade block visar explicit status-/data-gating.
- Privacy-scan, source/data/semantic/GPX/database/statistics/time/web-tester passerar. Råarkiv, SQLite och raw JSON exporteras inte till `web/`; lokal GPX-preview är noindex och browser-lokal.
- GitHub Actions QA `38212386732` passerade på exact-head `a45cd90` med screenshots för 1536, 1440, 1200, 1024, 900, 768, 390 och 360 px; samtliga granskades visuellt. Därefter passerade exact-head QA `38214549680` på docs-release-head `b46125f` och `38214751968` på aktuell GitHub-head `3a04b49`. Den första körningen `38212201934` föll på en för bred overflowkontroll av kvalitetstabellens avsiktliga scrollbar och ersattes av `a45cd90`.
- Automatisk Pages-körning `38214840161` passerade efter aktuell QA. Publicerad URL `https://www.loppanalys.se/gax100-analys/` laddades och verifierades med aktuell 2026-data, könsfilter, percentilemarkörer, releasekandidatens UI och den centrala GDPR-länken. Pages API:s anonyma `/pages`-endpoint gav 404, men workflow-jobbet och publicerad sida är verifierade.

## Externa begränsningar

- Ingen officiell, redistribuerbar historisk GPX-årsfil för 2023–2026 är rättighetsklar. 2026 Garmin-kurs är visuellt verifierad till 161,45 km/697 hm, men testade exportendpoints gav `{}`.
- Ingen verifierad checkpoint-koordinatserie, mellantidsankrad positionsrekonstruktion eller tidsstämplad deltagar-GPS finns. Publik route geometry, höjdprofil, jämförelse och replay är därför separata capabilities och replay/årsgeometri är gated.
- Ålder, klasser, placeringsresa, standouts, pacing retention och fullständigt segmentlab saknar tillräckligt gemensamt källunderlag.
- Ingen GAX-specifik anonymiseringsbegäran finns i repositoryt; `PRIVACY_REGISTER.md` kräver en slutlig manuell kontroll mot externa begäranden före publicering.
- Lokal npm/Playwright-körning saknas i Codex-miljön; riktig browser-QA körs i GitHub Actions.

## Nästa session

1. Läs `RELEASE_READINESS.md`, `WORK_QUEUE.md`, `COMPONENT_MATRIX.md` och aktuell head `a45cd90`.
2. Behåll Draft PR #2 öppen; merga inte och lägg inte till GAX100 i katalogen utan godkännande.
3. Om nya datakällor erhålls: registrera dem i `SOURCE_REGISTER.md`, uppdatera `DATA_COVERAGE.md`/`GPX_COVERAGE.md`, kör import- och privacy-QA och dokumentera rättigheter innan publicering.
4. Om release ska föreslås: uppdatera denna fil på ny head, kör exact-head Actions och gör ny visuell granskning av artifakten.
