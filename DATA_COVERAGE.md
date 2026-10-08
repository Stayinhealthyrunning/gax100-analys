# DATA_COVERAGE.md

## Inventeringsstatus 2026-10-08

`Identifierad` = länk/underlag känt. `Verifierad` = läst i officiell sida/PDF. `Nedladdad` = råfil arkiverad lokalt. `Normaliserad` = kuraterad tabell med proveniens. Råarkivet är lokalt och ignorerat; normaliserad SQLite byggs reproducerbart men publiceras inte.

## Uppmätt importtäckning

Importerade editions: **13** (2014–2024, 2021-A, 2021-B och 2026). Importerade resultatposter: **826**. Tidsobservationer: **1 838**. Normaliserad status: **FINISHED 581**, **DNF 100**, **UNKNOWN 145**, **DNS 0**. 2025: **0**, eftersom den officiella detalj-URL:n svarade HTTP 404. Se `data/IMPORT_REPORT.md` för editionsfördelning och återuppbyggnadskommandon.

## Editionsmatris 2014–2026

| Upplaga | Officiell resultatkälla | FINISHED | DNF | DNS | Kön | Klubb/ort | Sluttider | Mellantider/kontrollpunkter | Banversion | GPX | Källstatus |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2014 | [årsida](https://gax100.se/resultat/resultat-2014/) | verifierad tabell | saknade målpassager, ej statusfält | ej publicerad separat | namn, ej könsfält | saknas i tabell | verifierad, blandad notation | verifierad: Magleberg 44, Haväng 80, Sandhammaren 130, mål | ej versions-ID | ej verifierad | verifierad HTML; ej nedladdad/normaliserad |
| 2015 | [årsida](https://gax100.se/resultat/resultat-2015/) | verifierad; sidan anger 24 inom tidsgräns | verifierad narrativt/saknad målkolumn | ej separat | namn, ej könsfält | Club/Town/Country | verifierad; även cut-off-text | verifierad: 44/80/130/mål | ej versions-ID | ej verifierad | verifierad HTML; ej nedladdad/normaliserad |
| 2016 | [årsida](https://gax100.se/resultat/resultat-2016/) | identifierad | ej verifierad, åtkomsttimeout | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | identifierad; åtkomsthinder |
| 2017 | [årsida](https://gax100.se/resultat/resultat-2017/) | verifierad tabell | ej fullständigt inventerad | ej separat | namn/narrativ, ingen könskolumn | Club/Town | verifierad | verifierad: 44/80/130/mål | ej versions-ID | ej verifierad | verifierad HTML; ej nedladdad/normaliserad |
| 2018 | [årsida](https://gax100.se/resultat/resultat-2018/) | identifierad | ej inventerad | ej inventerad | ej inventerad | ej inventerad | ej inventerad | ej inventerad | ej verifierad | ej verifierad | identifierad; ej extraherad |
| 2019 | [årsida](https://gax100.se/resultat/resultat-2019/) | identifierad | ej inventerad | ej inventerad | ej inventerad | ej inventerad | ej inventerad | ej inventerad | ej verifierad | ej verifierad | identifierad; ej extraherad |
| 2020 | [årsida](https://gax100.se/resultat/resultat-2020/) | identifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | identifierad; webbläsaråtkomstfel |
| 2021-A | [årsida](https://gax100.se/resultat/resultat-2021/) | verifierad: sidan anger 27 mål av 38 startande | verifierad narrativt | ej separat | damer/herrar | klubbfält | verifierad | verifierad: 43/44, 79/80, 130/131, mål | ej versions-ID | ej verifierad | verifierad HTML; ej nedladdad/normaliserad |
| 2021-B | [samma årsida](https://gax100.se/resultat/resultat-2021/) | separat upplaga omnämns; block ej avgränsat | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | identifierad; kräver avgränsning |
| 2022 | [årsida](https://gax100.se/resultat/resultat-2022/) | verifierad lista | ej fullständigt räknad | ej separat | damer/herrar | klubbfält | verifierad | verifierad: 44/80/130/mål | PM hänvisar till 2022-bana | fil ej arkiverad | verifierad HTML/PDF-hänvisning |
| 2023 | [årsida](https://gax100.se/resultat/resultat-2023/) | verifierad: 69 av 89 enligt sidan | verifierad/listad | ej separat | damer/herrar | klubbfält | verifierad | verifierad: 44/80/130/mål | 2023 PM/banbeskrivning | AllTrails-hänvisning, ej fil | verifierad HTML/PDF; ej normaliserad |
| 2024 | [årsida](https://gax100.se/resultat/resultat-2024/) | verifierad: 54 av 87 enligt sidan | verifierad: dam 25 %, herr 43 % | ej separat | damer/herrar | klubbfält | verifierad | verifierad: Magleberg/Haväng/Sandhammaren/mål | ny sträcka vid Knäbäckshusen från 2024 | ej verifierad separat fil | verifierad HTML; ej nedladdad/normaliserad |
| 2025 | [indexlänk](https://gax100.se/resultat/) | indexlänk verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | ej verifierad | efter-2024 ej verifierad | ej verifierad | identifierad; detaljsida åtkomstfel |
| 2026 | [resultatindex](https://gax100.se/resultat/) | verifierad HTML | verifierad HTML | verifierad HTML | kvinnor/män | klubbfält | verifierad | ej synliga i indexutdrag | aktuell 2026-bana | [Garmin-kurs](https://connect.garmin.com/app/course/484861455), ej GPX-arkiv | verifierad index; ej nedladdad/normaliserad |

## Filformat, åtkomst och GPX

- Resultat 2014–2024 publiceras som HTML-tabeller på årsidor. 2025 finns som indexlänk men detaljsidan kunde inte hämtas i sessionen. 2026 har HTML-tabell och en nedladdningslänk vars fil-URL/format ännu inte följts.
- `GaxPM2023.pdf` är PDF och beskriver historiska banavvikelser samt hänvisar till års-GPX. Den är ännu inte lokalt arkiverad.
- Arrangörens bana-sida säger att aktuell GPX är uppdaterad för 2026 och länkar Garmin Connect-kursen ovan. Ingen års-GPX är nedladdad i projektet.
- Verifierad banhistorik: 2023 års PM samt aktuell bana-sida; 2024 års nya sträcka förbi Knäbäckshusen efter stormen Babet. Årsgeometri före/efter 2024 är inte verifierad genom GPX-jämförelse.
- Äldre GPX hänvisas till AllTrails/Facebook; ingen direkt offentlig, autentisk och publiceringsklar fil är verifierad.

## Status- och fältregler

Tom sluttid är inte automatiskt DNF/DNS. Äldre fri text och cut-off-noteringar måste importeras med råvärde och fältproveniens. Kontrollpunktsavstånd 43/44, 79/80 och 130/131 km är källvärden och får inte tyst avrundas. 2021 modelleras som två editions-ID:n även om sidan sammanför upplagorna.

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
