# GAX100 – oberoende paritets- och UX-revision, 2026-10-12

## Baslinje och omfattning

Normerande källa: `Stayinhealthyrunning.github.io/standards/LOPPANALYS_STANDARD_V1_0.md` (v1.0.0). Referenser: Ultravasan, Gotaleden, Österlen Spring Trail och Sätila Trail. Granskad applikation är `codex/gax100-etapp2`, med förbättringarna i Draft PR #3 ovanpå Draft PR #2. Denna revision gäller GAX100:s resultatbaserade produkt; ingen merge, katalogrelease eller GPX-redistribution ingår.

Källbas: 14 editioner, 945 resultat och 1 838 importerade mellantidsobservationer. Geografiskt underlag har separat rättighets- och årsanknytningsgrind. Resultatens namn och ursprungsdata får inte användas för ogrundad personidentitetskoppling.

## Standardparitet – faktisk kodstatus

| Standardblock | Status på denna arbetsbranch | Kvar till full standard |
|---|---|---|
| 1. Hero, loppval | Delvis | Källstödd editionväljare, tematisk GAX-rubrik och portalnavigation finns. Skarp egen licensierad herobild/OG-bild och maskinläsbar eventkonfiguration saknas. |
| 2. Loppet i siffror | Funktionellt | Fem parallella kort på desktop, inklusive median och medel per källverifierat kön. Saknade startantal visas som saknade. |
| 3. Hitta din löpare | Kraftigt förbättrad | Sökresultaten går nu att välja direkt under fältet, inklusive Alla år, kön/klubb/status, resultathandlingar, favorit och årschips. Komplettera klubb-autocomplete med tangentbordsnavigering och full tillgänglighetsrevision. |
| 4. Individuell analys | Betydligt förbättrad | Verkliga mellantider, kronologiska delsträckor, verifierad fysisk fart och kumulativ tidslucka mot fast komplett FINISHED-medianfält. Valda segment synkroniseras mellan tabell och flera diagram. GPS/höjd samt officiella placeringsresor saknas ännu. |
| 5. Direktjämförelse 2.0 | Delvis funktionellt | Exakt två val, A/B-kort, verklig tvåseriegraf, signerade checkpointgap, dela, byt, Back/Forward och flerårsval. Ingen syntetisk gränsöverskridande banjämförelse. Saknar replaymodal, höjdprofil, avancerad segmentlab och kamerakontroller. |
| 6. Kartduell 2–5 | Väljare finns; replay spärrad | 2–5-resultatsval, årschips och förklarad avstängning. Kräver rättighetsklar års-GPX, koordinatsatta checkpoints och verifierbar tidskoppling innan kartreplay kan byggas. |
| 7. Personlig loppplan | Funktionell för täckta år | Källstödda delsträckor Start→Mål, normaliserade andelar och exakt måltid; mediantid, justering ±5/15 min och återställning. Testad med 510 möjliga historiska profiler; ingen påhittad segmentplan för 2025/2026. Återstår delning/utskrift, valbar kohort och kartinteraktion där rättigheter medger. |
| 8. Fältstatistik | Funktionell, interaktiv | Histogram och percentiler med Alla/Kvinnor/Män när n≥5, klickbara histogramintervall, P10/P25/P50/P75/P90 som kan fylla simulerad måltid. Tidsmål visar retrospektiv ungefärlig fältplacering utan officiell rank-inferens. Tid/placering visar sluttid på X och källplacering på Y (1 högst), med möjlighet att öppna profilen även när punkter överlappar. |
| 9. Fördjupade analyser | Delvis implementerad med källgrindar | Editionsbunden fast referenskohort för medianpassager och kvartil-/percentilintervall, snabbaste verifierade sista segment, DNF:s **senast registrerade** passage (aldrig antaget avhoppställe), rapporterat kön och klubbar med n≥5. Full placeringsresa, åldersanalys, GPS-bunden pacing samt avancerade prestations- och historiska personkopplingsmoduler återstår. |
| 10a. Bana och historik | Delvis | Årshistorik och extern källkarta; lokal, användarvald GPX-preview. Inte godkänd publik årsgeometri, höjd eller deltagarreplay. |
| 10b. Resultatdatabas | Funktionell | Filtrering/sortering, 10 resultat per sida, mobilkort och öppna/jämför/duell/spara/dela. |
| 10c. Metod, hjälpinformation | Delvis | Käll- och metodförklaringar samt modulspecifik hjälp i centrala diagram. Saknar komplett bibliotek med varje (i)-text enligt §13 och fullständiga privacy-/retentionbeslut. |
| §14 Gemensamt mallpaket | Ej uppfyllt | Webben är fortfarande eventspecifik (`web/app.js`), inte en fullt utbytbar `event.json`-driven blockmotor. Nästa lopp kräver fortfarande handarbete. |
| §15–17 Tillgänglighet och release | Delvis | Responsiva Chromium-test, flera tangentbordsåtgärder, deep links, Back/Forward, privat/förvalt noindex. Kräver full 200 %-zoom, skärmläsar-/tangentbords-QA och korrekt delningsmedia innan paritet kan påstås. |

### Genomförd förbättring i senaste arbetsomgången

**Delsträckelabbet:** Fältstatistiken kompletteras nu med två valbara, verkliga ankare (Start, officiella passager, Mål), referensval Alla/Kvinnor/Män med lägsta n=5, mediantid och källstödda kvartil-/percentilintervall. År 2023 har verifierat 44→80 km-intervall om 36 km, men 2024 har inte verifierade kontrollavstånd och visar inte km-tempo. Endast aggregerade resultat visas; inga nya personliga segmenttopplistor förrän GDPR-granskningen är färdig.

**Resultatdatabasen:** 10/25/50 resultat per sida, intervallräknare, en-knappsfilteråterställning och stabil svensk sortering. Delningslänkar för sökträffar mellan år använder rätt upplaga.

**Test:** Utökade kontrakttester i `tests/test_field.js` och Chromium-scenarier i `tests/e2e/gax100.spec.js`. Aktuell exact-head-QA måste fortfarande verifieras vid releasebedömning. Ingen merge eller katalogpublicering.

## Högprioriterad kvarlista

1. **Separat integritetsreleasegrind:** samordna med pågående GDPR-arbete. Kontrollera privata suppressions i export, personer under 18 med okänd ålder, historiska publika artefakter och Actions-hemligheter innan någon merge av datagren.
2. **Ingen falsk banreplay:** fastställ arrangörsrättigheter för GPX, verkliga checkpointkoordinater, årsversioner och återanvändningsvillkor. Avstå från obekräftade positionsinterpolationer.
3. **Block 9-statistik:** källanknutna delsträckomedianer, kvartiler, DNF-passager, slutspurt och kön-/klubbstatistik är nu byggda. Nästa nivå är officiell placeringsresa och utökad individuell pacing **endast** om verifierat källunderlag och komplett kohort tillkommer.
4. **Fullständig standardarkitektur:** extrahera beräkningsmoduler, state-kontrakt, UI-block, hjälpbibliotek och eventkonfiguration i en separat granskbar mall-PR; undvik en engångsomskrivning av referensprojekten.
5. **Tillgänglighet och grafik:** komplettera OG/hero med rättighetsklar tävlingsbild, ordagranna hjälptexter enligt §13, 200 %-zoom, keyboard-only och visuell QA på 1536/1440/1200/1024/900/768/390/360 px.
6. **Slutlig QA:** verifiera exakt head i GitHub Actions samt en oberoende visuell granskning. Draft-PR:er får inte auto-mergas och portalens katalog ändras inte utan projektägarens godkännande.

## Risk för falsk paritet

Jämförelse 2.0 betyder här ännu **verkliga tidstabeller och två tidsserier, inte full kartreplay**. Kartduell betyder ännu **urval och deklarerad dataspärr, inte en fungerande löparpositionsduell**. Detta är en medveten, datakällestyrd skillnad från de fyra referenssystemen. Att fylla luckorna med godtycklig GPX, ranking eller syntetiska tider strider mot standarden.

## Testbevis

`tests/test_field.js` verifierar grupptrösklar, faktiska DNF-passager, avslutningar, verklig källbaserad placering och individens kumulativa gap mot en fix referenskohort. `tests/test_plan.js` kontrollerar exakt summerad måltid över riktiga profiler. `tests/test_comparison.js` kontrollerar B−A, samma-editions-gating och avsaknad av falska mellanårsgap. Chromium E2E kontrollerar responsivitet, all-årsurval, Back/Forward, registrerade passager utan distans, placeringspunkt via säker väljare och publik GPX-fils egen filväljare. Slutligt GitHub Actions-resultat och SHA ska avläsas på den sista commit som avses för merge; äldre gröna körningar räcker inte.
