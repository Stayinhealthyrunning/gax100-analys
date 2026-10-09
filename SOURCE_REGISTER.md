# SOURCE_REGISTER.md

## Primärkällor

| ID | Källa | Användning | Status |
|---|---|---|---|
| GAX-RESULT | https://gax100.se/resultat/ | Index och officiella resultat 2026 samt länkar till 2014–2025 | Identifierad |
| GAX-R2026-PDF | https://gax100.se/wp-content/uploads/2026/07/Resultat-till-hemsidan.pdf | Officiell 2026-tabell med separata Kvinnor/Män-listor; könsproveniens | Verifierad; nedladdad lokalt |
| GAX-COURSE | https://gax100.se/bana-karta/ | Aktuell bana, GPX, banprofil och banbeskrivning | Identifierad |
| GAX-GARMIN-2026 | https://connect.garmin.com/app/course/484861455 | Arrangörens länkade interaktiva kurs/GPX för 2026 | Identifierad; nedladdning återstår |
| GAX-R2024 | https://gax100.se/resultat/resultat-2024/ | Exempel på mellantider och DNF-statistik | Identifierad |
| GAX-R2023 | https://gax100.se/resultat/resultat-2023/ | Mellantider 44/80/130 km och mål | Identifierad |
| GAX-R2022 | https://gax100.se/resultat/resultat-2022/ | Mellantider och vinnardata | Identifierad |
| GAX-R2021 | https://gax100.se/resultat/resultat-2021/ | Historiska mellantider och två 2021-upplagor | Identifierad |
| GAX-PM2023 | https://gax100.se/wp-content/uploads/2024/03/GaxPM2023.pdf | Historiska banavvikelser och GPX-hänvisning | Identifierad |
| GAX-INFO | https://gax100.se/information/ | Arrangörens deltagarinformation och GPX-hänvisning | Identifierad |

## Sekundär kontrollkälla

| ID | Källa | Användning | Status |
|---|---|---|---|
| DUV-2026 | https://statistik.d-u-v.org/eventdetail.php?event=129899&language=EN | Oberoende kontroll av 2024–2026 vinnare och deltagarantal | Identifierad; ej ersättning för officiell källa |

## Officiella resultatsidor 2014–2026

Årsidorna följer `https://gax100.se/resultat/resultat-YYYY/` för 2014–2025. Resultatindexet är `https://gax100.se/resultat/` och listar alla länkar samt aktuell 2026-tabell. 2016, 2020 och 2021/2025 hade åtkomst- eller avgränsningshinder i denna inventering; se `DATA_COVERAGE.md`.

## Standard

Den normerande standarden är `Stayinhealthyrunning/Stayinhealthyrunning.github.io/standards/LOPPANALYS_STANDARD_V1_0.md`. Den lästes fullständigt via en tillfällig shallow Git-klon av GitHub-repot; den innehåller 1.0.0-kravbaslinjen och no-fabrication/evidensspärrar. Webbcachefelet kring katalog-URL:n kringgicks med GitHub-åtkomst.

## Källhantering

Hämtad-datum, URL, sidtitel, relevant år/sektion och eventuella PDF/GPX-filer ska registreras när datainsamlingen genomförs.

## ETAPP 2A råarkiv

`scripts/fetch_sources.ps1` hämtar officiella HTML-sidor, 2026-resultat-PDF:en och `GaxPM2023.pdf` till lokalt ignorerat `data/raw/`. `data/raw/MANIFEST.json` innehåller hämtnings-tidpunkt, status, URL och SHA-256. Vid senaste körningen fanns 16 manifestposter, 15 nedladdade och 2025 misslyckades med HTTP 404. Rådata publiceras inte i repot.
