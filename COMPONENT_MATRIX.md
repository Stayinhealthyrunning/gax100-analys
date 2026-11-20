# GAX100 – komponentmatris mot Loppanalys Standard 1.0

Granskad mot den fullständiga centrala `LOPPANALYS_STANDARD_V1_0.md` samt kontrakt och testmönster i Ultravasan, Gotaleden, ÖST och Sätila. `Fullt möjligt` betyder att GAX100 har tillräckligt verifierat underlag för en ärlig implementation i nuvarande export. `Delvis möjligt` betyder att UI eller delmängd finns men att standardens fulla datakontrakt eller rättigheter saknas. `Saknar underlag` betyder att blocket ska förbli gated/tomt och inte fyllas med uppskattningar.

| Standardblock | Datakontrakt | Beräkningsmetod | Interaktivitet | Visuellt utförande | Testtäckning | Bedömning |
|---|---|---|---|---|---|---|
| Race header / editionsval | `RaceEdition`, källstatus | vald edition; 2021-A/B separata | årsväljare, URL-state | hero med tydlig källstatus | `test_web`, E2E årval | fullt möjligt |
| Race facts | FINISHED, DNF, starters, könstider | positiv sluttid; median/medel med n≥5 | edition refresh | fem faktakort i desktoprad, könsfärger | E2E viewport + statistik | fullt möjligt |
| Runner finder | `ResultAppearance` namn/klubb/status/tid | filtrering utan identitetsmerge | sök, klubb, kön, sort, pagination | tabell desktop/kort mobil | E2E sök/filter/sort/mobil | fullt möjligt |
| Individual analysis | ett resultat + verifierade observationer | kronologiska intilliggande segment, inga gap-interpolationer | öppna resultat, välj segment | segmenttabell, relativfartsdiagram, 100 %-linje | E2E runner/plan, semantik | delvis möjligt |
| Direct comparison 2.0 | exakt två resultat, checkpoint-ID + verifierat källavstånd | gap per gemensam kontrollpunkt | välj/rensa två | tabell; separat cross-edition-varning | E2E jämförelse, semantik | delvis möjligt |
| Map duel | 2–5 resultat; route/elevation/replay separata capabilities | ingen publik löparposition | valbegränsning 2–5 | ärligt gated-läge; separat lokal karta | E2E 2–5/gating, GPX-test | delvis möjligt |
| Personal plan | ≥5 FINISHED, gemensam segmentserie | medianiserade andelar + största restmetod | justerbar TT:MM:SS | historisk referens separerad från simulering | E2E mål, web-kontrakt | delvis möjligt |
| Field overview / histogram | FINISHED med giltig tid | 15-minutersmål, 8–35 intervall, P10/P50/P90 | editionval | y=antal, x=sluttid, percentilmarkörer | statistik/web/E2E | fullt möjligt |
| Percentiles | samma verifierade sluttidsmängd | linjär h=(n−1)×p, avrundning före visning | edition refresh | P10/P25/P50/P75/P90-tabell | statistik/time-format | fullt möjligt |
| Time vs placement | rank + finish_seconds | endast numerisk rank/tid | edition refresh | scatter med axeltexter | E2E/data contract | delvis möjligt |
| Status breakdown / DNF flow | explicit status | counts; UNKNOWN hålls separat | edition refresh | statuskort med tom-/delstatus | semantik + web | delvis möjligt |
| Segment statistics / lab | jämförbara kontrollpunkter och avstånd | segmenttid/fart endast vid komplett par | individuell segmentval | tabell + relativfart | GPX/semantik + E2E | delvis möjligt |
| Placement journey / gains | verifierad placering över kontrollpunkter | kräver placeringsobservationer per checkpoint | ej aktiverad | gated, ingen nollgraf | datakontrakt | saknar underlag |
| Strongest finish / standouts | fullständig segmentserie + jämförbar kohort | kräver stabil segment- och fältmodell | ej aktiverad | gated | inget verifierat kontrakt | saknar underlag |
| Pacing retention / field spread | minst två jämförbara segment per kohort | kräver fullständig kohort | plan/individ endast delvis | gated där kohort saknas | plan- och semantiktest | delvis möjligt |
| Gender / classes / age | källfält per resultatrad | kön endast när rubricering/källa stöder | könsfilter; klasser/ålder av | blå män/rosa kvinnor; saknade tomma | 2026 gender + E2E | delvis möjligt |
| Clubs / podium | klubb/rank från källa | counts och numeriska placeringar | klubbfilter/sort | klubbfält; ingen fabricerad podiumanalys | E2E klubb/filter | delvis möjligt |
| Edition/person history | source-scoped result IDs; editions | volym/status/observationer, ej personidentitet | editionval; inget identitetsmerge | historiktabell | database/web | delvis möjligt |
| Course difficulty / route versions | `RouteEvidence`, rättighetsstatus | GPX-linjejämförelse endast lokalt | karta/GPX preview | separat lokal karta/höjdprofil | GPX geometry/preview | delvis möjligt |
| Results database | public normalized projection | källvärden, explicit saknat | search/filter/sort/actions/share | 10 desktoprader, kort mobil | E2E + privacy | fullt möjligt |
| Methodology / data quality | source register, import report, capability states | definitioner och proveniens | hjälpdialog + metoddetails | svensk metod- och tomlägestext | web/privacy | fullt möjligt |
| Privacy / release safety | public sanitized export, privacy register | inga råarkiv/SQLite/secret values | static scan + CI | noindex på lokal kartpreview | `test_public_privacy`, CI | delvis möjligt |

## Avvikelser som är avsiktliga

- GAX100 har ännu ingen verifierad kontrollpunktsplacering per löpare, ingen autentisk tidsstämplad löpar-GPS och ingen publiceringsklar års-GPX. Därför är placement journey, replay och publik historisk geometri gated.
- Den publika exporten innehåller publicerade namn/klubbar som behövs för resultatdatabasen, men inte `raw_json`, råsökvägar, SQLite eller rå-GPX. Ingen GAX-specifik anonymiseringsbegäran finns registrerad i detta repository; en manuell rättighets-/integritetskontroll krävs före publik lansering.
- Referensrepo:s kontrakt används som jämförelseunderlag, inte som källa för GAX100-data. Alla GAX-värden måste fortsatt spåras till `SOURCE_REGISTER.md`.
