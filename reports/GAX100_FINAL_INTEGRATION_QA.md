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
| GDPR och privata källor | Privat register krävs ovillkorligt; 17 hashkontrollerade källfiler; skyddade resultat tas bort | Administrativ kontroll av verkligt filtrerad export och historiska artefakter återstår |

## Källa, integritet och säkerhet

- Verifierad *rå* källa: 14 upplagor, 945 resultat och 1 838 mellantidsobservationer. Publicerat resultatantal kan vara **lägre** efter skyddad-rad-filtrering; 945 är inte ett krav på publikt antal.
- `LOPPANALYS_SOURCE_APP_ID`/`LOPPANALYS_SOURCE_APP_PRIVATE_KEY` hämtar endast det privata GAX100-trädet med kortlivad lästoken. 17 filer måste ha godkänd relativ sökväg, byteantal och SHA-256. Ny preflight kopierar inget förrän hela mängden kontrollerats; testet använder enbart syntetiska bytes.
- `LOPPANALYS_PRIVACY_REGISTRY_B64` krävs för varje offentlig export. Saknat eller ogiltigt register stoppar jobbet; skyddade och verifierat minderåriga poster tas bort i sin helhet. Okänd ålder förblir okänd, aldrig antagen vuxen.
- Rå HTML/PDF, privat transkription och SQLite ska inte lämna CI-jobbet eller publikt `web/`. Det tidigare `web/data.json` är ett **historiskt fryst snapshot** i Git-historiken; det är inte bevis på aktuell GDPR-filtrering och måste granskas separat före release. Ingen historikomskrivning görs här.
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
- Lokal syntax-, kontrakts-, syntetisk audit- och webtest passerar. Verklig
  registeraudit och Chromium-körning inväntar GitHub Actions på slutlig head;
  lokal `npm`/Playwright saknas. Frysna snapshot-UX är **inte** ett bevis på
  aktuell GDPR-filtrering. Historisk Pages-uppgift nedan gäller endast en
  tidigare publicering och är inte en ny release eller behörighet att publicera.

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

1. Det äldre publika snapshotet och historiska commit-/Actions-/cacheartefakter kräver en behörig, separat integritetsrevision med faktisk privat registermatchning. Ett grönt syntetiskt test är inte en sådan revision.
2. Den publika faktaradens FINISHED/DNF-tal härleds i dag ur **visade** resultatrader, medan verifierat startantal kommer från upplagekällan. Efter skyddsfiltrering kan talen därför ha olika population. Innan release behöver UI antingen källstödda integritetssäkra aggregat eller tydlig etikett för publicerat urval; ingen uppblåst officiell siffra får antas.
3. Ingen verifierad, rättighetsklar 2024–2026-GPX eller checkpoint-koordinatserie finns för publik replay. Kartduell förblir gated.
4. Full mallparitet saknas för bildhero, central hjälpkatalog, komplett mobil
   diagramzoom utan horisontell läsning, kart-/replaykontroller och flera
   dataintensiva placerings-/åldersblock. Se matrisen ovan.

**Rekommendation:** Håll integrations-PR:n Draft. Varken merge, ny Pages-publicering eller länk i Loppanalys.se-katalogen är godkänd av denna QA. Nästa beslut kräver exakt-head Actions, visuell artefaktgranskning, integritetsrevision av verklig export och uttryckligt ägar-/rättighetsgodkännande.
