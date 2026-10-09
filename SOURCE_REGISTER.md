# SOURCE_REGISTER.md

## Primärkällor

| ID | Källa | Användning | Status |
|---|---|---|---|
| GAX-RESULT | https://gax100.se/resultat/ | Index och officiella resultat 2026 samt länkar till 2014–2025 | Identifierad |
| GAX-R2026-PDF | https://gax100.se/wp-content/uploads/2026/07/Resultat-till-hemsidan.pdf | Officiell 2026-tabell med separata Kvinnor/Män-listor; könsproveniens | Verifierad; nedladdad lokalt |
| GAX-COURSE | https://gax100.se/bana-karta/ | Aktuell bana, GPX, banprofil och banbeskrivning | Identifierad |
| GAX-GARMIN-2026 | https://connect.garmin.com/app/course/484861455 | Arrangörens länkade interaktiva kurs/GPX för 2026 | Identifierad; nedladdning återstår |
| GAX-GARMIN-EXPORT-2026 | https://connect.garmin.com/proxy/course-service-1.0/gpx/course/484861455 | Dokumenterad Garmin-exportadress testad mot 2026-kursen | HTTP 200 men `{}`/2 bytes; ingen GPX erhållen |
| GAX-R2024 | https://gax100.se/resultat/resultat-2024/ | Exempel på mellantider och DNF-statistik | Identifierad |
| GAX-R2023 | https://gax100.se/resultat/resultat-2023/ | Mellantider 44/80/130 km och mål | Identifierad |
| GAX-R2022 | https://gax100.se/resultat/resultat-2022/ | Mellantider och vinnardata | Identifierad |
| GAX-R2021 | https://gax100.se/resultat/resultat-2021/ | Historiska mellantider och två 2021-upplagor | Identifierad |
| GAX-PM2023 | https://gax100.se/wp-content/uploads/2024/03/GaxPM2023.pdf | Historiska banavvikelser och GPX-hänvisning | Identifierad |
| GAX-INFO | https://gax100.se/information/ | Arrangörens deltagarinformation och GPX-hänvisning | Identifierad |
| GAX-TRACKERS | https://gax100.se/information/trackers/ | Arrangörens tracker-länk och Legends Tracking-hänvisning | Verifierad länk; historisk data ej verifierad |
| GAX-GPX-AUDIT | `data/gpx-audit.json` | Reproducerbar lokal audit av fem GPX-råfiler; hash, distans, höjd och tidsproveniens | Verifierad lokalt; råfiler ej publicerade |
| GAX-GPX-REPORT | `GPX_COVERAGE.md` | Årsvis GPX-inventering, kandidatbanor, rättigheter och capability-status | Uppdaterad 2026-10-09 |

## Sekundär kontrollkälla

| ID | Källa | Användning | Status |
|---|---|---|---|
| DUV-2026 | https://statistik.d-u-v.org/eventdetail.php?event=129899&language=EN | Oberoende kontroll av 2024–2026 vinnare och deltagarantal | Identifierad; ej ersättning för officiell källa |

## Historiska GPX-kandidater

| Källa | Route-id/fil | Årskoppling | Status |
|---|---|---|---|
| Plotaroute | 2343997 | 2016 | Publik kandidat; ej arrangörsverifierad |
| Plotaroute | 2337511 | 2020 | Publik kandidat; webbläsaråtkomst gav hinder i körningen |
| Plotaroute | 1589517, 1463190 | 2021 | Publika kandidater; två namn/varianter |
| Plotaroute | 2310208, 2310202, 2310215 | 2022 | Publika kandidatvarianter |
| Plotaroute | 2332034 | 2023 | Publik kandidat; ej arrangörsverifierad |
| Plotaroute | 2659350 | 2024 | Publik kandidat; ej lokalt arkiverad |
| Trace de Trail | 48826, 139697 | 2018, 2021 | Lokalt analyserade; rättighet/officialitet ej klarlagd |
| AllTrails | `The_Gax_100_miles.gpx` | okänt historiskt | Lokalt analyserad; personlig icke-publicerbar användning |
| Garmin Connect | course 484861455 | 2026 | Arrangörslänkad officiell kurs; offentlig visning verifierad, GPX-export ej arkiverad |

Detaljer, hashvärden och spatial jämförelse finns i `GPX_COVERAGE.md` och `data/gpx-audit.json`.

## Officiella resultatsidor 2014–2026

Årsidorna följer `https://gax100.se/resultat/resultat-YYYY/` för 2014–2025. Resultatindexet är `https://gax100.se/resultat/` och listar alla länkar samt aktuell 2026-tabell. 2016, 2020 och 2021/2025 hade åtkomst- eller avgränsningshinder i denna inventering; se `DATA_COVERAGE.md`.

## Standard

Den normerande standarden är `Stayinhealthyrunning/Stayinhealthyrunning.github.io/standards/LOPPANALYS_STANDARD_V1_0.md`. Den lästes fullständigt via en tillfällig shallow Git-klon av GitHub-repot; den innehåller 1.0.0-kravbaslinjen och no-fabrication/evidensspärrar. Webbcachefelet kring katalog-URL:n kringgicks med GitHub-åtkomst.

## Källhantering

Hämtad-datum, URL, sidtitel, relevant år/sektion och eventuella PDF/GPX-filer ska registreras när datainsamlingen genomförs.

## ETAPP 2A råarkiv

`scripts/fetch_sources.ps1` hämtar officiella HTML-sidor, 2026-resultat-PDF:en och `GaxPM2023.pdf` till lokalt ignorerat `data/raw/`. `data/raw/MANIFEST.json` innehåller hämtnings-tidpunkt, status, URL och SHA-256. Vid senaste körningen fanns 16 manifestposter, 15 nedladdade och 2025 misslyckades med HTTP 404. Rådata publiceras inte i repot.
