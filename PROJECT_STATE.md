# Projektstatus: GAX100 Analys

## Aktuell integrationskandidat 2026-10-14

Arbetsbranch `codex/gax100-final-integration-2026-10-14` utgår från Draft PR #6:s
head `67b7e6a`; denna innehåller redan Draft PR #5. Draft PR #7 är en äldre
riskklassning ovanpå #5 och har granskats separat. Inga tidigare PR:er har
mergats här. `reports/GAX100_FINAL_INTEGRATION_QA.md` är den aktuella
sammanhållna funktions-, integritets- och QA-bedömningen; äldre avsnitt nedan
är historiska. Privat källpreflight och fem separata faktakortshjälper har
tillkommit på denna branch. På `502cf11` passerade full QA `38565887921`,
snapshot UX `38565887999` och privacy guard `38565887862`; Playwright-
artefakten öppnades och ett kvarvarande horisontellt mobilt diagramzoom-läge
dokumenterades. Denna statuskomplettering kräver egen exact-head CI efter
push. Ingen merge eller katalogpublicering.

Nästa session: kontrollera aktuell PR #8-head och Actions på exakt SHA; läs
`reports/GAX100_FINAL_INTEGRATION_QA.md`; åtgärda mobil diagramzoom utan att
försvaga evidens- eller GDPR-spärrar; låt behörig ägare granska verklig
filtrerad export och historiska offentliga artefakter före varje releasebeslut.


## Privat källmigrering (2026-10-14)

- 16 officiella råkällor och den exakta Git-blobben för 2025-transkriptionen
  har verifierats i det privata källrepot; 17/17 filer matchar manifestets
  byteantal och SHA-256.
- En separat, staplad Draft-PR tar bort den identifierande transkriptionen från
  det publika trädet och återställer alla källor fail-closed med kortlivad
  GitHub App-token. Befintliga Draft-PR:er är oförändrade.
- Läsappen och secrets `LOPPANALYS_SOURCE_APP_ID` samt
  `LOPPANALYS_SOURCE_APP_PRIVATE_KEY` måste konfigureras och full CI passera
  innan källborttagningen kan lämna Draft. Rättslig grund,
  återanvändningsrätt, gallring och oberoende krypterad backup återstår.

## Visuell komponent-QA (tillägg 2026-10-12)

- Föregående granskning av standardlayout bedömdes otillräcklig för visuell slutacceptans: aktiverade mobilvyer hade inte granskats analysdel för analysdel.
- `tests/e2e/visual-parity.spec.js` har nu skärmbilder och funktionella scenarier för nio **aktiva** lägen på 390/1440 px (18 bilder), utöver ursprungliga responsivvyer 360–1536 px.
- Konkret upptäckta fel: sönderbrutna 4–7-kolumnstabeller i mobil individanalys, direktjämförelse och loppplan; otillräckligt läsbar historiktabell; A/B-rollfärg som felaktigt gav magenta även till män. Dessa har kodrättats, med automatiska regressionstester.
- Kvarstående: små SVG-axeltexter på mobil, bildhero, avancerat replay/kartduell, full WCAG/skärmläsarrevision och manuell jämförelse av varje aktivt läge med fyra referenssystem. Ingen release eller merge ska ske enbart på grön Playwright.
- Full dokumentation: `reports/GAX100_VISUAL_COMPONENT_AUDIT_2026-10-12.md`. Exakt Actions-head för slutliga ändringar verifieras separat.


## Komplettering: oberoende paritetsarbete i Draft PR #3 (2026-10-12)

Detta avsnitt beskriver **en separat granskningsbranch**, `audit/gax100-plan-precision-2026-10-12`, baserad på `codex/gax100-etapp2`. Det historiska ETAPP 2-läget nedan avser PR #2 före dessa förbättringar. PR #2 och PR #3 är fortsatt Draft och får inte mergas eller publiceras automatiskt.

- Ny källanknuten statistikmodul `web/field.js` och regressionstester `tests/test_field.js`. Inkluderar edition- och checkpoint-scopade kompletta referenskohorter, mediansplit, kvartiler (n≥10), P10/P90 (n≥20), verifierad avslutningsdelsträcka, rapporterat kön/klubb samt senaste faktiskt observerade DNF-kontroll.
- Utökad fältstatistik: målutfall mot verkliga FINISHED-tider med uttryckligen hypotetisk placering, könsurval i histogram/percentiler, klickbara resultat i placeringsdiagram och koppling mellan percentilmåltid och måltidssimulatorn.
- Ny `GaxField.runnerGap()` för individuell kumulativ tidslucka mot en fast grupp fullföljare med exakt samma verkliga kontrollpunkter; segmentval synkroniseras med övrig individuell analys.
- 2023 ger 70 kompletta profiler, 2024 ger 53. Flera äldre editioner har verifierade mellantider; 2025 och 2026 saknar publik splitserie och får därför ingen delsträckeprofil.
- Jämför inte sluttider över banversioner som om banan vore identisk. Ingen icke godkänd GPX, höjd eller tidsstämplad GPS-replay har publicerats. Varken databasens 945 resultat eller den frysta importkedjan har ändrats.
- Testkrav: `npm run test:field`, befintliga Node-test, uppdaterade Chromium E2E, source/semantic/privacy och responsiv screenshots. Exakt godkänd slut-SHA måste läsas ur Actions före merge; misslyckade mellancommits är inte releasebevis.
- Kvarvarande standardluckor: licensierad tävlingshero/OG, ban- och höjdprofil/replay, full kartduell, verifierad personidentitet mellan år, vissa dataintensiva placering/åldersmoduler, event.json-driven generisk mall och oberoende GDPR-releasekontroll.


### Tillägg: delsträckelabb och resultatdatabas

- Två verkliga ankare i en komplett, editionsbunden referenskohort kan väljas från Start via mellanliggande officiella kontroller till Mål. Den nya `GaxField.segmentLab()` räknar enbart med observerade passager/sluttider och samma källverifierade kontrollsekvens; kohort n≥5, Q25–Q75 n≥10, P10–P90 n≥20. Kvinnor/män kan väljas när gruppens n≥5. Ingen individuell topplista publiceras i labbet innan ålders- och suppressionsskyddet är färdiggranskat.
- Verifierade checkpointavstånd bevaras från `web/plan.js` till `web/field.js`. Exempel: 2023 Magleberg 44 km → Haväng 80 km = 36 km, medan samma intervall 2024 saknar verifierad fysisk distans och måste visa detta.
- Resultatdatabasen stöder 10 (standard), 25 eller 50 rader per sida, synligt aktuellt intervall, återställning, svenska sök-/sorteringsregler och deterministisk sekundärsortering på result_id.
- Delningslänk från sökresultat i läget Alla år använder nu resultatets egen edition, inte en annan aktiv upplaga.
- Den visuella QA-granskningen av faktaraden ledde till en ny kompakt uppställning av könens median, medeltid och antal med semantiska blå/rosa värden; responsivt testas både 390 och 1440 px.
- QA måste vara grön på den exakta slutliga PR #3-headen, även efter dokumentationscommits. Fullt geografiskt replay/positionsmodellering är fortfarande separat rättighets- och källgated.

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
