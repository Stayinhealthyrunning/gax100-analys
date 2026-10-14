# GAX100 – integrations- och QA-läge, 2026-10-14

## Beslut och beroendekedja

Integrationskandidat: `codex/gax100-final-integration-2026-10-14`, baserad på
`67b7e6a` (Draft PR #6). PR #6 innehåller `c5cda27` från Draft PR #5; samma
kod ska inte mergas en andra gång. PR #7 (`4da1f99`) tillför endast en audit
av den **äldre** PR #5-headen. Auditen har lästs, men kopieras inte ordagrant:
dess råd att behålla den identifierande 2025-fixturen är upphävt av PR #6:s
privata källmigrering. Ingen befintlig PR, `main`, produktionskatalog eller
publik Pages-konfiguration ändras här.

Norm: [Loppanalys Standard 1.0](https://github.com/Stayinhealthyrunning/Stayinhealthyrunning.github.io/blob/main/standards/LOPPANALYS_STANDARD_V1_0.md).
Se även `COMPONENT_MATRIX.md`, `reports/GAX100_STANDARD_PARITY_AUDIT_2026-10-12.md`
och `SOURCE_REGISTER.md`. Referenssystemen beskriver beteendekontrakt; de
utgör inte källor för GAX100:s deltagarresultat.

## Slutlig historisk distributionsrevision (PR #8, 2026-10-14)

Efter [senaste granskningskommentaren i PR #8](https://github.com/Stayinhealthyrunning/gax100-analys/pull/8#issuecomment-6170463619)
har [en avgränsad revision](GAX100_HISTORICAL_DISTRIBUTION_AUDIT.md) gjorts
utan ny datainsamling och utan att publicera personuppgifter. GitHubs API
listar 215 aktiva QA-/snapshot-artefakter (199 före privat källmigrering);
två äldre ZIP-strukturer kontrollerades, men övrigt artefaktinnehåll är
okontrollerat. Actions-cachelistan är tom. Den befintliga Pages-sidan är
fortfarande live med det äldre frysta JSON-snapshotet, inte PR #8:s aktuella
export. Nuvarande export och fem Git-snapshots hade fortsatt 0 träffar i
det privata skyddsregistret, vilket **inte** avgör ålder eller laglig grund.

Viktigast: den tidigare identifierande 2025-transkriptionen är fortfarande
publikt nåbar via introduktionscommit och äldre PR-referenser #2–5 och #7;
PR #2 och #5 har dessutom tillgänglig patchmetadata för tillägget. Aktuellt
`main` och PR #8-head saknar filen, men gamla refar/diffar kvarstår. Detta är
en bekräftad historisk exponeringsrisk, inte ett fel i den nya filtrerade
exporten. [GitHub Support-underlaget](GAX100_GITHUB_SUPPORT_CASE_DRAFT.md)
är förberett men **inte skickat**. Ingen historikomskrivning, radering,
merge eller ny publicering har gjorts. Ägare måste besluta om juridisk
klassificering, bevarande, samordnad sanering och eventuell Support-kontakt.

## Funktionsmatris mot standarden

`Fungerar` avser källstödd funktion, inte full generisk standardparitet.

| Block | Läget i denna kandidat | Verifiering / återstående spärr |
|---|---|---|
| År och distans | 14 upplagor, inklusive 2021-A/B; ett 100 miles-lopp | Årsval och URL-state testas; inget påhittat andra distansval |
| Sök och Alla år | Namn, startnummer, klubb, status/kön; resultatskopade ID | Browser-scenarier; samma namn över år blir inte personnyckel |
| Faktarad och kön | Fem kort, rapporterat kön, n≥5, separat median/medel | Ny separat `(i)`-hjälp per kort; startantal visas endast där fastställt |
| Fältstatistik | Histogram, percentiler, status, DNF:s senast observerade passage, fast kohort | Statistik-/fält- och browser-tester; saknade statusar fylls inte i |
| Individuell analys | Verkliga kronologiska segment, relativfart, tidslucka och segmentval | Ingen GPS- eller placeringsresa utan originalobservationer |
| Direktjämförelse 2.0 | Två resultat, signerade gemensamma checkpointgap och två tidsserier inom jämförbar upplaga | Fleråriga slut-/segmenttider spärras utan jämförbar banversion; ingen replay |
| Kartduell | Val av 2–5; begripligt spärrläge | Ingen deltagarposition utan rättighetsklar årsgeometri och tidsankare |
| Personlig loppplan | Historisk segmentkohort n≥5, valbar måltid, exakt sekundsumma | Plan är ett scenario, inte en prognos; 2025/2026 saknar splits |
| Bangeometri och höjd | Lokal GPX-preview och offentlig extern källkarta | Fem lokala kandidater saknar fastställd publiceringsrätt/årsanknytning |
| Flerårsjämförelse | Volym/status/täckning per upplaga | Lika namn/distans bevisar varken person- eller banidentitet |
| Resultatdatabas | Sök/filter/sortering, 10/25/50 per sida, mobila radkort | Använder publicerad, filtrerad export i full QA |
| Mobil och tillgänglighet | Responsiva tester 360–1536 px, axe på 390/1440 px | Full manuell skärmläsar-, zoom- och visuell referensrevision återstår |
| Ljud och delning | Resultat-/jämförelselänkar; inget automatiskt ljud | Replayljud saknar godkänd media/positionsmodell och är avstängt |
| GDPR och privata källor | Privat register krävs ovillkorligt; 17 hashkontrollerade källfiler; skyddade resultat tas bort | Verklig export och 5 Git-snapshots granskade; äldre Actions-/cache-/Pages-kopior återstår för ägargranskning |

## Källa, integritet och säkerhet

- Verifierad *rå* källa: 14 upplagor, 945 resultat och 1 838 mellantidsobservationer. Publicerat resultatantal kan vara **lägre** efter skyddad-rad-filtrering; 945 är inte ett krav på publikt antal.
- `LOPPANALYS_SOURCE_APP_ID`/`LOPPANALYS_SOURCE_APP_PRIVATE_KEY` hämtar endast det privata GAX100-trädet med kortlivad lästoken. 17 filer måste ha godkänd relativ sökväg, byteantal och SHA-256. Ny preflight kopierar inget förrän hela mängden kontrollerats; testet använder enbart syntetiska bytes.
- `LOPPANALYS_PRIVACY_REGISTRY_B64` krävs för varje offentlig export. Saknat eller ogiltigt register stoppar jobbet; skyddade och verifierat minderåriga poster tas bort i sin helhet. Okänd ålder förblir okänd, aldrig antagen vuxen.
- Rå HTML/PDF, privat transkription och SQLite ska inte lämna CI-jobbet eller publikt `web/`. Det tidigare `web/data.json` är ett **historiskt fryst snapshot** i Git-historiken; det är inte bevis på aktuell GDPR-filtrering. Fem sådana Git-blobbar har nu granskats mot verkligt register; separat granskning av tidigare externa kopior återstår. Ingen historikomskrivning görs här.
- Originalens rättsliga grund, återanvändningsrätt, retention, oberoende krypterad backup och GPX-licenser kräver ägarbeslut. Ingen tredjepartsgeometri läggs till i publik export.

## QA och acceptans

### PR #8: åtgärder efter senaste granskning (2026-10-14)

- Relativfartens mobil-dialog ritar samma barvärden och 100 %-referens i en
  separat 340-enheters vy. Fem y-axelvärden och ordnade delsträckenummer
  ryms utan horisontell scroll vid 360/390 px. Originaldiagrammets
  tangentbordsval och desktop-dialog är oförändrade; dialogen stängs med Esc
  och fokus återgår till öppningsknappen. Playwright kontrollerar verklig
  `scrollWidth`, barernas synliga rektanglar och skärmbilder vid 360/390/768/1440.
- Faktaraden skiljer **källtotal startande** från **GDPR-filtrerade publicerade
  FINISHED/DNF**. Ingen kvot mellan olika populationer visas. Även snabbaste
  tid och könsgrupper avser publicerat urval. Syntetisk browserregression
  lägger till en skyddad FINISHED och DNF i råfixturen men utesluter dem ur
  publicerad payload, sökning och resultatlänk.
- Ny administrativ kontroll `scripts/audit_public_export.js` körs i full QA
  efter verklig privat restore och export. Den jämför varje offentlig rad och
  observation mot råbasen minus verkliga registerträffar, söker skyddade
  identifierare/namn i publik JSON och HTML/JS, och skriver enbart aggregerade
  antal och PASS/FAIL. Publicerad sökning och URL-upplösning är bundna till
  samma filtrerade `data.results`. Git-historikens `web/data.json`-blobbar
  granskas separat med samma privata regler. Historiska Actions-artefakter,
  externa cachekopior och tidigare faktisk Pages-distribution kan inte
  därmed anses granskade; de kräver behörig ägargranskning utan offentlig
  personuppgiftsdiff eller återpublicering.
- Alla 945 råresultat saknar ett verifierat åldersfält i den kuraterade
  resultatmodellen; okänd ålder förblir okänd. Kartduell, positionsrekonstruktion
  och GPS-replay förblir spärrade utan årsverifierad rättighetsklar geometri
  och tillräckliga kontrollpunkter. Inga privata original, resultat eller
  publicerade datakontrakt har ändrats.
- På kodhead `4752d9a18b107a91b458720432056ca2d3786a23` passerade
  [full GAX100 QA #38575583801](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38575583801)
  med 51/51 Chromiumtester,
  [snapshot UX #38575583547](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38575583547)
  och [privacy guard #38575583532](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38575583532).
  Verklig registeraudit: PASS, 945 källresultat, 945 publicerade, 0 skyddade
  träffar, 8 publika kod-/HTML-filer och 5 historiska Git-snapshots utan träff.
  Artefakt `11900112082` laddades ned och diagramdialogens skärmbilder öppnades
  och granskades vid 360/390/768/1440 px. Blå staplar, rosa streckad
  100 %-referens, fem axelvärden och tre läsbara delsträckor syns i mobilvyn;
  ingen horisontell dialogscroll eller kapning sågs. Esc/fokus och desktop
  verifieras också av Playwright. Lokal `npm`/Playwright saknas.
  Dokumentationsändringar efter denna kodhead behöver egen exact-head QA.
  Fryst snapshot-UX är **inte** ett bevis på aktuell GDPR-filtrering.
  Historisk Pages-uppgift nedan gäller endast en tidigare publicering och är
  inte en ny release eller behörighet att publicera.

PR #6:s bashead `67b7e6a` hade grön [obligatorisk QA](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38543620956), [snapshot UX QA](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38543620852) och [privacy guard](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38543620821). Dessa körningar bevisar inte den **nya** headen.

På kod-/rapporthead `502cf11fde4be7cdca4bf75f660c089438e5601c` passerade
[full GAX100 QA #38565887921](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38565887921),
[snapshot UX #38565887999](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38565887999)
och [privacy guard #38565887862](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38565887862).
Full QA:s steg för privat restore, den nya syntetiska preflighten,
käll-/semantik-/GDPR-tester och Chromium passerade. Actions-artefakten
`11895885286` (run head SHA `502cf11…`) öppnades lokalt och skärmbilderna
granskades för aktiv sökning, individanalys, jämförelse, plan, segmentlabb,
resultat och diagram på 390/1440 px samt befintlig responsiv matris. Inget
nytt viewportöverflöd eller kapat faktakort sågs. Den förstorade
relativfartsgrafen kräver dock horisontell läsning i 390-px-dialogen; detta
är en kvarvarande visuell avvikelse, inte full paritet med standard §2.3.
En dokumentationscommit efter denna kontroll måste få egen exact-head QA;
tidigare gröna körningar får inte etiketteras som bevis för en senare SHA.

Lokalt på denna branch: statistik, plan, fält, jämförelse, registerkontrakt, källintegritet, privacy och web-kontrakt passerade före ändringarna. Efter ändringarna passerade syntetisk 17-filspreflight, `node --check web/app.js` och `tests/test_web.js`. Full browser-QA körs i Actions eftersom lokal Playwright-installation saknas.

Lokal `node tests/test_gpx_preview.js` kunde inte öppna loopback-adressen
`127.0.0.1:57915` i den begränsade PowerShell-miljön (`connect EACCES`). Detta
är inte ett godkänt testresultat; samma test måste passera i Actions.

## Kvarvarande defekter och releasebeslut

1. Den äldre identifierande 2025-transkriptionen är bekräftat nåbar via äldre publika Git-/PR-refar; PR #2 och #5:s additioner har publikt patchfält. 215 aktiva artefakter finns, varav endast två ZIP-strukturer har kontrollerats. Den gamla Pages-versionen är fortfarande live med fryst JSON. Åtgärdsomfång, externa cachekopior och eventuell Support-process kräver behörigt ägarbeslut. Ingen personuppgiftsdiff eller råkälla får publiceras som revisionsbevis.
2. Ingen verifierad, rättighetsklar 2024–2026-GPX eller checkpoint-koordinatserie finns för publik replay. Kartduell förblir gated.
3. Full mallparitet saknas för licensierad bildhero, central hjälpkatalog, avancerade kart-/replaykontroller och flera dataintensiva placerings-/åldersblock. Se matrisen ovan.

**Rekommendation:** Håll integrations-PR:n Draft. Varken merge, ny Pages-publicering eller länk i Loppanalys.se-katalogen är godkänd av denna QA. Kodheadens Actions, skärmbilder och verkliga export är verifierade; slutligt publiceringsbeslut kräver även kontroll av historiska distributionskopior, explicit rättighets-/integritetsbeslut och gröna checks på den faktiska slutliga PR-headen.
