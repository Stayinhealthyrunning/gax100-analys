# DATA_COVERAGE.md

## Inventeringsstatus 2026-10-09

`Identifierad` = länk/underlag känt. `Verifierad` = läst i officiell sida/PDF. `Nedladdad` = råfil arkiverad lokalt. `Normaliserad` = kuraterad tabell med proveniens. Råarkivet är lokalt och ignorerat; normaliserad SQLite byggs reproducerbart men publiceras inte.

## Uppmätt importtäckning

Importerade editions: **13** (2014–2024, 2021-A, 2021-B och 2026). Importerade resultatposter: **826**. Tidsobservationer: **1 838**. Normaliserad status efter korrigerad äldre tidsparser och explicit DNF-klassificering: **FINISHED 582**, **DNF 139**, **UNKNOWN 105**, **DNS 0**. Verifierat startantal finns för 2015 (**53**), 2021-A (**38**), 2023 (**89**) och 2024 (**87**); övriga upplagor lämnas som ej fastställda. 2026 års officiella PDF verifierar kön för alla 110 importerade resultat: **22 Kvinnor**, **88 Män**. 2025: **0**, eftersom den officiella detalj-URL:n svarade HTTP 404. Se `data/IMPORT_REPORT.md` för editionsfördelning och återuppbyggnadskommandon.

## Editionsmatris 2014–2026

| Upplaga | Officiell resultatkälla | FINISHED | DNF | DNS | Kön | Klubb/ort | Sluttider | Mellantider/kontrollpunkter | Banversion | GPX | Källstatus |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2014 | [årsida](https://gax100.se/resultat/resultat-2014/) | verifierad tabell | saknade målpassager, ej statusfält | ej publicerad separat | namn, ej könsfält | saknas i tabell | verifierad, blandad notation | verifierad: Magleberg 44, Haväng 80, Sandhammaren 130, mål | ej versions-ID | ej verifierad | verifierad HTML; nedladdad och normaliserad med UNKNOWN där status saknas |
| 2015 | [årsida](https://gax100.se/resultat/resultat-2015/) | verifierad; sidan anger 24 inom tidsgräns | verifierad narrativt/saknad målkolumn | ej separat | namn, ej könsfält | Club/Town/Country | verifierad; även cut-off-text | verifierad: 44/80/130/mål | ej versions-ID | ej verifierad | verifierad HTML; nedladdad och normaliserad med källstödda fält |
| 2016 | [årsida](https://gax100.se/resultat/resultat-2016/) | identifierad | importerad status/finish från nedladdad källa; äldre format kräver försiktighet | ej verifierad | ej verifierad | ej verifierad | verifierad rånotation efter import | importerade kontrollkolumner, se råvärden | ej versions-ID | ej verifierad | nedladdad och normaliserad; äldre statusfält delvis UNKNOWN |
| 2017 | [årsida](https://gax100.se/resultat/resultat-2017/) | verifierad tabell | importerad status/finish; saknad explicit status för vissa rader | ej separat | namn/narrativ, ingen könskolumn | Club/Town | verifierad | verifierad: 44/80/130/mål | ej versions-ID | ej verifierad | verifierad HTML; nedladdad och normaliserad |
| 2018 | [årsida](https://gax100.se/resultat/resultat-2018/) | importerad | importerad status/finish; källfält saknas där sidan inte anger dem | ej separat | saknas i importerad källtabell | källfält där det finns | verifierad rånotation | importerade timingkolumner | ej versions-ID | ej verifierad | nedladdad och normaliserad; coverage saknas för vissa fält |
| 2019 | [årsida](https://gax100.se/resultat/resultat-2019/) | importerad | importerad status/finish; källfält saknas där sidan inte anger dem | ej separat | saknas i importerad källtabell | källfält där det finns | verifierad rånotation | importerade timingkolumner | ej versions-ID | ej verifierad | nedladdad och normaliserad; coverage saknas för vissa fält |
| 2020 | [årsida](https://gax100.se/resultat/resultat-2020/) | importerad | importerad status/finish; explicit DNF saknas där källan inte anger det | ej separat | saknas i importerad källtabell | källfält där det finns | verifierad rånotation | importerade timingkolumner | ej versions-ID | ej verifierad | nedladdad och normaliserad; äldre statusfält delvis UNKNOWN |
| 2021-A | [årsida](https://gax100.se/resultat/resultat-2021/) | verifierad: sidan anger 27 mål av 38 startande | verifierad narrativt | ej separat | damer/herrar | klubbfält | verifierad | verifierad: 43/44, 79/80, 130/131, mål | ej versions-ID | ej verifierad | verifierad HTML; nedladdad och normaliserad |
| 2021-B | [samma årsida](https://gax100.se/resultat/resultat-2021/) | separat upplaga avgränsad som 24–25 juli | importerad status/finish | ej separat | källans gruppfält där de finns | klubbfält | verifierad | verifierad: 43/44, 79/80, 130/131, mål | ej versions-ID | ej verifierad | nedladdad och normaliserad som separat edition |
| 2022 | [årsida](https://gax100.se/resultat/resultat-2022/) | verifierad lista | importerad status/finish | ej separat | damer/herrar | klubbfält | verifierad | verifierad: 44/80/130/mål | PM hänvisar till 2022-bana | fil ej verifierad | nedladdad och normaliserad; PM-länk registrerad |
| 2023 | [årsida](https://gax100.se/resultat/resultat-2023/) | verifierad: 69 av 89 enligt sidan | importerad explicit/listad status | ej separat | damer/herrar | klubbfält | verifierad | verifierad: 44/80/130/mål | 2023 PM/banbeskrivning | AllTrails-hänvisning, ej autentisk fil | nedladdad och normaliserad; GPX saknas |
| 2024 | [årsida](https://gax100.se/resultat/resultat-2024/) | verifierad: 54 av 87 enligt sidan | importerad explicit/listad status | ej separat | damer/herrar | klubbfält | verifierad | verifierad: Magleberg/Haväng/Sandhammaren/mål | ny sträcka vid Knäbäckshusen från 2024 | ej verifierad separat fil | nedladdad och normaliserad; historisk banversion textverifierad |
| 2025 | [indexlänk](https://gax100.se/resultat/) | indexlänk verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | efter-2024 ej verifierad | ej verifierad | identifierad; detaljsida åtkomstfel |
| 2026 | [resultatindex](https://gax100.se/resultat/) och [officiell resultat-PDF](https://gax100.se/wp-content/uploads/2026/07/Resultat-till-hemsidan.pdf) | verifierad HTML/PDF; 66 verifierade sluttider | verifierad HTML/PDF | verifierad HTML/PDF | kvinnor/män verifierat från PDF: 22/88 | klubbfält | verifierad | ej importerade i indexutdrag | aktuell 2026-bana | [Garmin-kurs](https://connect.garmin.com/app/course/484861455), ej GPX-arkiv | index + PDF nedladdade/normaliserade; kön har PDF-proveniens, mellantider saknas |

## Filformat, åtkomst och GPX

- Resultat 2014–2024 publiceras som HTML-tabeller på årsidor. 2025 finns som indexlänk men detaljsidan kunde inte hämtas i sessionen. 2026 har HTML-tabell samt officiell PDF med separata Kvinnor/Män-tabeller; PDF:en är nedladdad i råarkivet och används endast som verifierad könskälla.
- `GaxPM2023.pdf` är PDF, lokalt arkiverad i råarkivet, och beskriver historiska banavvikelser samt hänvisar till års-GPX.
- Arrangörens bana-sida säger att aktuell GPX är uppdaterad för 2026 och länkar Garmin Connect-kursen ovan. Ingen verifierad års-GPX är nedladdad som redistribuerbar projektfil.
- Verifierad banhistorik: 2023 års PM samt aktuell bana-sida; 2024 års nya sträcka förbi Knäbäckshusen efter stormen Babet. Årsgeometri före/efter 2024 är inte verifierad genom GPX-jämförelse.
- Äldre GPX hänvisas till AllTrails/Facebook; ingen direkt offentlig, autentisk och publiceringsklar fil är verifierad.

## Status- och fältregler

Tom sluttid är inte automatiskt DNF/DNS. Råtext som uttryckligen börjar med `DNF` klassificeras som DNF; övrig fri text och cut-off-noteringar behåller UNKNOWN med råvärde och fältproveniens. Kontrollpunktsavstånd 43/44, 79/80 och 130/131 km är källvärden och får inte tyst avrundas. 2021 modelleras som två editions-ID:n även om sidan sammanför upplagorna. Startantal lagras bara när arrangörens text uttryckligen anger det; ett publicerat resultatregister är inte automatiskt ett startregister.

## Genomförbarhetsbedömning mot standardblock

| Block | Bedömning | Underlag |
|---|---|---|
| Race identity/year/distance | fullt möjligt | officiellt namn, årsidor och 100 miles |
| Race facts/status/KPI | delvis möjligt | flera resultatkällor, heterogena äldre statusfält |
| Runner finder/result database | delvis möjligt | HTML-tabeller finns, råarkiv/result-ID saknas |
| Individual analysis | delvis möjligt | sluttider finns, normalisering återstår |
| Direct Comparison 2.0 | saknar underlag | segment- och banjämförbarhet ej verifierad |
| Kartduell/replay | saknar underlag | autentiska publicerbara GPX/replay saknas |
| Personlig loppplan | delvis möjligt | splits finns för vissa år, ej full täckning |
| Field overview/percentiles | delvis möjligt | listor finns, counts/status måste QA-extraheras |
| Course history | delvis möjligt | textuell historik finns, års-GPX-geometri saknas |
| Method/provenance | fullt möjligt | standard och källor är identifierade |

## Datapolicy

Saknade observationer förblir tomma. Inga mellantider, GPS-positioner, identiteter, statusar eller banjämförelser får fabriceras. Underlag följer `identifierat → verifierat → nedladdat → normaliserat`.
