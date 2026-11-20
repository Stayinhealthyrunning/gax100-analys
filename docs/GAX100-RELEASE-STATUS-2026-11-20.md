# GAX100 – tekniskt granskningsläge 2026-11-20

> **Draft / offentlig release spärrad.** Detta är en utvecklings- och QA-rapport. Varken den här filen, grön CI eller privat testdata är ett juridiskt publiceringsgodkännande.

## Levererat och testat

- GAX 100 miles har **14 upplagor 2014–2026**, inklusive de två separata `2021-A` och `2021-B`.
- Full import i det **privata** källrepot: 945 resultat, 651 fullföljande, 1 838 ursprungliga tidsobservationer. 2023 års officiella resultatlista är normerande med 90 resultat och 70 fullföljande.
- Sätila Blueprint används för analysgränssnittet: resultat, löparsökning, individuella profiler, observerade kontrollpassager, direktjämförelse, historik, delsträckelabb och personlig loppplan.
- [PR #10](https://github.com/Stayinhealthyrunning/gax100-analys/pull/10) har åtgärdat mobilt måltidsformat.
- [PR #11](https://github.com/Stayinhealthyrunning/gax100-analys/pull/11) har infört popup med de fyra orienterande etapperna och flyttat klassfördelningen till `Start till mål`.
- Delsträckelabbet och loppplanen har en samlad sektion; `Starkaste avslutningen` har testade namngivna **demolöpare** när verkliga tidspar finns i den fiktiva datan.
- [PR #12](https://github.com/Stayinhealthyrunning/gax100-analys/pull/12) ersatte blockerade dubbla Pages-workflows med en nedladdningsbar offlineförhandsvisning med **fiktiva löpare**.
- [Privat PR #47](https://github.com/Stayinhealthyrunning/loppanalys-private-data/pull/47) gör releasefiltreringen striktare mot okända privata fält och felaktiga godkännandetyper.
- [Privat PR #48](https://github.com/Stayinhealthyrunning/loppanalys-private-data/pull/48) isolerar den privata Chromium-QA:n till loopback och blockerar extern trafik. [Autentiskt privat test på 14 upplagor](https://github.com/Stayinhealthyrunning/loppanalys-private-data/actions/runs/44715794078) passerade utan persondata i Actions-loggar eller artefakter.
- GAX100 är registrerat som ett **federerat** lopp i Agent Factory, inte som elfte nytt lopp. `main` i GAX-repot är inte ändrat av Draft-utvecklingen.

## Releaseblockerare (alla måste bedömas separat)

| Kontroll | Status 2026-11-20 |
|---|---|
| Rättslig grund och proportionalitetsbedömning för publicerad individanalys | **SAKNAS / STOPP** |
| Ålder: inget källfält för 945 löpare; ägarintyg finns men är inte oberoende åldersbevis | **KRÄVER JURIDISK BEDÖMNING** |
| Schema-2 GDPR-spärrregister, opt-out, årlig/ny import och audit av sanerad export | **INGET RELEASEGODKÄNNANDE** |
| Arrangörens källrätt och tillåten återpublicering av namngivna resultat | **OKLART / STOPP** |
| 2026 Garmin-kurs (arrangörslänk) och historiska GPX | **INGA ORIGINALBYTE/LICENS VERIFIERADE** |
| Historisk GitHub Support-sanering av tidigare data | **SLUTLIGT KVITTO ÅTERSTÅR** |
| Produktionsmerge, Pages, kataloglänk och GAX-sida på Loppanalys.se | **INTE GENOMFÖRT** |

## Automatisering och nästa tekniska arbete

Den privata QA:n körs även enligt schema tisdagar/fredagar. Agent Factory rapporterar GAX som separat federerat repo och fortsätter genomföra **säkra kod-, test- och metadataarbeten**. En grön utvecklings-PR innebär **inte** att deltagare får publiceras.

Tillåten fortsatt framdrift: dokumenterade banår, kontroller med riktiga tidspar i privat QA, syntax/Playwright/regressioner, fiktiv UX-förhandsvisning och förbättrad GDPR-kvalitetskontroll.

**Förbjudna genvägar:** kopiera originalresultat eller personliga GPS-spår till offentligt Git, slå på Pages, fabricera GPX-geometri, slå ihop 2021-A/B eller markera okänd ålder som verifierat vuxen. Mergning av föräldra-Draft [#9](https://github.com/Stayinhealthyrunning/gax100-analys/pull/9) förblir spärrad tills ovanstående granskats och godkänts.
