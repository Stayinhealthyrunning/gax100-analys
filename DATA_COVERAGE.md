# DATA_COVERAGE.md

## Inventeringsstatus 2026-10-09

`Identifierad` = länk/underlag känt. `Verifierad` = läst i officiell sida/PDF. `Nedladdad` = råfil arkiverad lokalt. `Normaliserad` = kuraterad tabell med proveniens. Råarkivet är lokalt och ignorerat; normaliserad SQLite byggs reproducerbart men publiceras inte.

## Uppmätt importtäckning

Importerade editions: **14** (2014–2026, med två verkliga 2021-upplagor). Importerade resultatposter: **945**. Tidsobservationer: **1 838**. Normaliserad status: **FINISHED 651**, **DNF 179**, **DNS 10**, **UNKNOWN 105**. Verifierat startantal finns för 2015 (**53**), 2021-A (**38**), 2023 (**89**), 2024 (**87**) och 2025 (**109 = 69 FINISHED + 40 DNF**); övriga upplagor lämnas som ej fastställda. 2026 års officiella PDF verifierar kön för alla 110 importerade resultat: **22 Kvinnor**, **88 Män**. 2025 importeras från arrangörens officiella PDF med 69 placerade FINISHED, 40 DNF och 10 DNS; DNF/DNS utan entydig könsrubrik lämnas utan könsantagande. Se `data/IMPORT_REPORT.md` för editionsfördelning och återuppbyggnadskommandon.

## Editionsmatris 2014–2026

| Upplaga | Officiell resultatkälla | FINISHED | DNF | DNS | Kön | Klubb/ort | Sluttider | Mellantider/kontrollpunkter | Banversion | GPX | Källstatus |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2014 | [årsida](https://gax100.se/resultat/resultat-2014/) | verifierad tabell | saknade målpassager, ej statusfält | ej publicerad separat | namn, ej könsfält | saknas i tabell | verifierad, blandad notation | verifierad: Magleberg 44, Haväng 80, Sandhammaren 130, mål | ej versions-ID | ej verifierad | verifierad HTML; nedladdad och normaliserad med UNKNOWN där status saknas |
| 2015 | [årsida](https://gax100.se/resultat/resultat-2015/) | verifierad; sidan anger 24 inom tidsgräns | verifierad narrativt/saknad målkolumn | ej separat | namn, ej könsfält | Club/Town/Country | verifierad; även cut-off-text | verifierad: 44/80/130/mål | ej versions-ID | ej verifierad | verifierad HTML; nedladdad och normaliserad med källstödda fält |
| 2016 | [årsida](https://gax100.se/resultat/resultat-2016/) | identifierad | importerad status/finish från nedladdad källa; äldre format kräver försiktighet | ej verifierad | ej verifierad | ej verifierad | verifierad rånotation efter import | importerade kontrollkolumner, se råvärden | ej versions-ID | Plotaroute-kandidat 2343997 identifierad, ej verifierad/arkiverad | nedladdad och normaliserad; äldre statusfält delvis UNKNOWN |
| 2017 | [årsida](https://gax100.se/resultat/resultat-2017/) | verifierad tabell | importerad status/finish; saknad explicit status för vissa rader | ej separat | namn/narrativ, ingen könskolumn | Club/Town | verifierad | verifierad: 44/80/130/mål | ej versions-ID | ej verifierad | verifierad HTML; nedladdad och normaliserad |
| 2018 | [årsida](https://gax100.se/resultat/resultat-2018/) | importerad | importerad status/finish; källfält saknas där sidan inte anger dem | ej separat | saknas i importerad källtabell | källfält där det finns | verifierad rånotation | importerade timingkolumner | ej versions-ID | Trace de Trail-kandidat lokalt auditerad; ej arrangörsverifierad | nedladdad och normaliserad; coverage saknas för vissa fält |
| 2019 | [årsida](https://gax100.se/resultat/resultat-2019/) | importerad | importerad status/finish; källfält saknas där sidan inte anger dem | ej separat | saknas i importerad källtabell | källfält där det finns | verifierad rånotation | importerade timingkolumner | ej versions-ID | ej verifierad | nedladdad och normaliserad; coverage saknas för vissa fält |
| 2020 | [årsida](https://gax100.se/resultat/resultat-2020/) | importerad | importerad status/finish; explicit DNF saknas där källan inte anger det | ej separat | saknas i importerad källtabell | källfält där det finns | verifierad rånotation | importerade timingkolumner | ej versions-ID | Plotaroute-kandidat 2337511 identifierad; inte arkiverad | nedladdad och normaliserad; äldre statusfält delvis UNKNOWN |
| 2021-A | [årsida](https://gax100.se/resultat/resultat-2021/) | verifierad: sidan anger 27 mål av 38 startande | verifierad narrativt | ej separat | damer/herrar | klubbfält | verifierad | verifierad: 43/44, 79/80, 130/131, mål | ej versions-ID | Plotaroute 1589517 och Trace de Trail 139697 lokalt auditerade; ej officiellt fastställda | verifierad HTML; nedladdad och normaliserad |
| 2021-B | [samma årsida](https://gax100.se/resultat/resultat-2021/) | separat upplaga avgränsad som 24–25 juli | importerad status/finish | ej separat | källans gruppfält där de finns | klubbfält | verifierad | verifierad: 43/44, 79/80, 130/131, mål | ej versions-ID | kandidatmaterial finns men ingen verifierad upplagekoppling | nedladdad och normaliserad som separat edition |
| 2022 | [årsida](https://gax100.se/resultat/resultat-2022/) | verifierad lista | importerad status/finish | ej separat | damer/herrar | klubbfält | verifierad | verifierad: 44/80/130/mål | PM hänvisar till 2022-bana | Plotaroute 2310208 lokalt auditerad; ej officiellt fastställd | nedladdad och normaliserad; PM-länk registrerad |
| 2023 | [årsida](https://gax100.se/resultat/resultat-2023/) | verifierad: 69 av 89 enligt sidan | importerad explicit/listad status | ej separat | damer/herrar | klubbfält | verifierad | verifierad: 44/80/130/mål | 2023 PM/banbeskrivning | Plotaroute 2332034 identifierad; AllTrails lokalt auditerad men rättighetsbegränsad | nedladdad och normaliserad; official GPX saknas |
| 2024 | [årsida](https://gax100.se/resultat/resultat-2024/) | verifierad: 54 av 87 enligt sidan | importerad explicit/listad status | ej separat | damer/herrar | klubbfält | verifierad | verifierad: Magleberg/Haväng/Sandhammaren/mål | ny sträcka vid Knäbäckshusen från 2024 | Plotaroute 2659350 identifierad; ej lokalt arkiverad/officiellt verifierad | nedladdad och normaliserad; historisk banversion textverifierad |
| 2025 | [resultatindex](https://gax100.se/resultat/) och [officiell resultat-PDF](https://gax100.se/wp-content/uploads/2025/07/GAX-Resultat-2025.pdf) | verifierad: 69 FINISHED | verifierad: 40 DNF | verifierad: 10 DNS | kön verifierat för 69 målrader: 14 Damer/55 Herrar; övriga ej antaget | klubbfält på publicerade rader | verifierad på 69 målrader | inga mellantider i PDF | efter-2024; års-GPX ej verifierad | ej verifierad | indexlänk och PDF identifierade/verifierade; PDF nedladdad och 119 rader normaliserade |
| 2026 | [resultatindex](https://gax100.se/resultat/) och [officiell resultat-PDF](https://gax100.se/wp-content/uploads/2026/07/Resultat-till-hemsidan.pdf) | verifierad HTML/PDF; 66 verifierade sluttider | verifierad HTML/PDF | verifierad HTML/PDF | kvinnor/män verifierat från PDF: 22/88 | klubbfält | verifierad | ej importerade i indexutdrag | aktuell 2026-bana | [arrangörens Garmin-kurs](https://connect.garmin.com/app/course/484861455) verifierad visuellt: 161,45 km/697 hm; GPX-export ej arkiverad | index + PDF nedladdade/normaliserade; kön har PDF-proveniens, mellantider saknas |

## Filformat, åtkomst och GPX

- Resultat 2014–2024 publiceras som HTML-tabeller på årsidor. 2025 länkas från resultatindexet till en officiell PDF (`GAX-Resultat-2025.pdf`) med 3 sidor och statusrader; den är nedladdad i råarkivet och importerad via den spårbara transkriptionsfilen `data/verified/result-2025-official.json`. 2026 har HTML-tabell samt officiell PDF med separata Kvinnor/Män-tabeller.
- `GaxPM2023.pdf` är PDF, lokalt arkiverad i råarkivet, och beskriver historiska banavvikelser samt hänvisar till års-GPX.
- Arrangörens bana-sida säger att aktuell GPX är uppdaterad för 2026 och länkar Garmin Connect-kursen ovan. Garmin Connect visar kursen `GAX100M-2026`, 161,45 km och 697 m stigning; fristående GPX-export kunde inte arkiveras i denna körning.
- Fem lokala GPX-filer är nu tekniskt verifierade som geometriunderlag; ingen är klassad som arrangörens officiella, redistribuerbara årsfil. Se `GPX_COVERAGE.md` och `data/gpx-audit.json`.
- Verifierad banhistorik: 2023 års PM samt aktuell bana-sida; 2024 års nya sträcka förbi Knäbäckshusen efter stormen Babet. Lokal spatial diagnostik visar skillnader mellan kandidatspår men fastställer inte officiella årsbanor.
- Plotaroute-kandidater finns för 2016, 2020, 2021, 2022, 2023 och 2024; de är publika kandidater och inte automatiskt officiella. Äldre GPX från AllTrails/Trace de Trail är rättighetsmässigt begränsade.

## Status- och fältregler

Tom sluttid är inte automatiskt DNF/DNS. Råtext som uttryckligen börjar med `DNF` klassificeras som DNF; övrig fri text och cut-off-noteringar behåller UNKNOWN med råvärde och fältproveniens. Kontrollpunktsavstånd 43/44, 79/80 och 130/131 km är källvärden och får inte tyst avrundas. 2021 modelleras som två editions-ID:n även om sidan sammanför upplagorna. Startantal lagras bara när arrangörens text uttryckligen anger det; ett publicerat resultatregister är inte automatiskt ett startregister.

## Genomförbarhetsbedömning mot standardblock

| Block | Bedömning | Underlag |
|---|---|---|
| Race identity/year/distance | fullt möjligt | officiellt namn, årsidor och 100 miles |
| Race facts/status/KPI | delvis möjligt | flera resultatkällor, heterogena äldre statusfält |
| Runner finder/result database | delvis möjligt | HTML-tabeller finns, råarkiv/result-ID saknas |
| Individual analysis | delvis möjligt | sluttider finns, normalisering återstår |
| Direct Comparison 2.0 | delvis möjligt | exakt gemensamma kontrollpunkter med likvärdigt källavstånd jämförs; övriga par visar ärligt tomläge |
| Kartduell/replay | delvis möjligt | 2–5-val och lokal/publicerad källkarta är möjliga; löparreplay och verifierad årsgeometri är fortsatt gated |
| Personlig loppplan | delvis möjligt | historisk segmentprofil och proportionell mål-tidssimulering finns där minst två kronologiska segment verifierats; inte prognos |
| Field overview/percentiles | fullt möjligt för importerade sluttider | median och linjär interpolation är testade; placeringar visas endast när källan har dem |
| Course history | delvis möjligt | textuell historik finns, års-GPX-geometri saknas |
| Method/provenance | fullt möjligt | standard och källor är identifierade |

## Datapolicy

Saknade observationer förblir tomma. Inga mellantider, GPS-positioner, identiteter, statusar eller banjämförelser får fabriceras. Underlag följer `identifierat → verifierat → nedladdat → normaliserat`.
