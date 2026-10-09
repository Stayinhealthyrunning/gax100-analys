# GAX100 historiskt GPX-arkiv

## Status 2026-10-09

Det lokala råarkivet innehåller fem GPX-filer. De är tekniskt läsbara och analyserade, men ingen av dem är i nuläget klassad som arrangörens officiella, publiceringsklar årsfil. `data/gpx-audit.json` innehåller SHA-256, punktantal, distans, höjddata, geografisk täckning och tidsproveniens. GPX-filerna ligger i det ignorerade privata råarkivet och kopieras inte till `web/`.

### Lokalt verifierade filer

| Fil | Ursprung/creator | SHA-256 | Punkter | Distans | Höjd | Tidsstämplar | Bedömning |
|---|---|---|---:|---:|---|---|---|
| `Gax 2021 100 Miles_final.gpx` | Plotaroute; route-id 1589517, Fredrik Palm | `7c7b9a0d…a520b272` | 2 452 | 161,15 km | 0–116 m, komplett | 2026-10-09, exporttid | Geometri-kandidat för 2021; inte löpartid |
| `Gax 100 Miles-2022-M6.gpx` | Plotaroute; route-id 2310208, Daniel Westergren | `5f1c8c18…0262a9ed` | 10 503 | 161,74 km | 0–116 m, komplett | 2026-10-09, exporttid | Geometri-kandidat för 2022; inte löpartid |
| `The_Gax_100_miles.gpx` | AllTrails; stängd rutt | `9073f562…43c1380` | 53 853 | 162,08 km | 0–119,72 m, komplett | Saknas | Historisk ruttkandidat; rättigheter hindrar publicering |
| `the-gax-100-miles-2018.gpx` | Trace de Trail; route-id 48826 | `d79593ea…6e30f0b` | 26 916 | 160,76 km | 2–128 m, komplett | 2026-10-09, exporttid | 2018-kandidat; stora lokala hopp måste granskas |
| `the-gax-100-miles-2021-162-km.gpx` | Trace de Trail; route-id 139697 | `bf5713a4…123f95b4` | 14 728 | 162,03 km | 1–128 m, komplett | 2026-10-09, exporttid | 2021-kandidat; inte officiellt fastställd |

Fullständiga hashvärden och geografiska bounds finns i `data/gpx-audit.json`. Alla fem spår är tillräckligt långa för att vara bangeometrier. Tidsserierna från Plotaroute/Trace de Trail är exporterade vid insamlingen och får inte användas som löparnas passagetider. AllTrails-filen saknar tidsstämplar.

## Kandidatkällor per år

Plotaroute-sidorna är publika kandidatbanor med exportkontroll och route-metadata, men ruttens koppling till ett officiellt GAX-år är inte i sig bevisad. Måtten nedan är publicerade route-metadata, inte ersättning för arrangörens officiella GPX.

| Möjligt år | Publik kandidat | Publicerat namn | Publicerad distans | Lokal fil | Status |
|---:|---|---|---:|---|---|
| 2014 | Ingen identifierad | — | — | Nej | saknar underlag |
| 2015 | Ingen identifierad | — | — | Nej | saknar underlag |
| 2016 | [Plotaroute 2343997](https://www.plotaroute.com/route/2343997) | Gax-2016-PT | 163,851 km | Nej | identifierad kandidat; publicerad av Daniel Westergren |
| 2017 | Ingen identifierad | — | — | Nej | saknar underlag |
| 2018 | [Trace de Trail 48826](https://tracedetrail.fr/en/trace/48826) | The Gax 100 Miles 2018 | — | Ja | kandidat; ej arrangörsverifierad |
| 2019 | Ingen identifierad | — | — | Nej | saknar underlag |
| 2020 | [Plotaroute 2337511](https://www.plotaroute.com/route/2337511) | Gax 100 Miles-2020-M4 | 160,869 km | Nej | identifierad kandidat; direktläsning gav åtkomstfel i webbläsaren |
| 2021-A/B | [Plotaroute 1589517](https://www.plotaroute.com/route/1589517), [1463190](https://www.plotaroute.com/route/1463190) | Gax 2021 100 Miles_final / Gax 2021 100 Miles | 161,331 / 161,471 km | Ja, plus Trace de Trail | kandidatmaterial; upplagekoppling ej slutligt verifierad |
| 2022 | [Plotaroute 2310208](https://www.plotaroute.com/route/2310208) | Gax 100 Miles-2022-M6 | 161,922 km | Ja | kandidatmaterial; ej arrangörsverifierad |
| 2023 | [Plotaroute 2332034](https://www.plotaroute.com/route/2332034) | Gax 100 Miles-2023-F1 | 163,618 km | Nej | identifierad kandidat; publicerad av Daniel Westergren |
| 2024 | [Plotaroute 2659350](https://www.plotaroute.com/route/2659350) | GAX100M-2024 | 161,003 km | Nej | identifierad kandidat; ej lokalt arkiverad |
| 2025 | Ingen verifierad GPX | — | — | Nej | saknar underlag |
| 2026 | [arrangörens bana/karta](https://gax100.se/bana-karta/) → [Garmin-kurs](https://connect.garmin.com/app/course/484861455) | GAX100M-2026 | Garmin visar 161,45 km | Nej | officiell kurs identifierad; fristående GPX-export ej arkiverad |

Andra Plotaroute-träffar som behöver källkoppling innan de kan tilldelas ett år är route-id 1799681 (`Gax 100miles`), 2343990 (`Gax-20215-M2`), 2343998 (`Gax-2016-IB`) samt 2310202/2310215 (2022-varianter). De räknas inte som årsbanor i appen.

## Knäbäckshusen

Arrangören anger att stranden vid Knäbäckshusen stängdes efter stormen Babet 2023 och att sträckan därför är ny från 2024. Det är den normerande källan för ändringens existens: [officiell banbeskrivning](https://gax100.se/bana-karta/). Äldre banlogik är dessutom explicit beskriven i [GaxPM2023.pdf](https://gax100.se/wp-content/uploads/2024/03/GaxPM2023.pdf): mellan Stenshuvud och Knäbäckshusen (cirka 90–93 km) tog loppet av mot stranden, och 2023 års GPX hänvisades till AllTrails/Facebook.

En lokal spatial kontroll med referenspunkt 55.64097, 14.27477 och 5 km analysradie visar:

- 2022-Plotaroute, AllTrails och Trace de Trail-2021 ligger inom cirka 35–36 m lokal Hausdorff-liknande avvikelse från varandra.
- Plotaroute-2021-finalen avviker lokalt cirka 302 m från dessa spår.
- 2018-kandidaten avviker cirka 123 m från 2022/AllTrails/Trace-2021.

Detta är ett tekniskt fynd, inte bevis för vilken fil som är den officiella 2024-banan. Den kan indikera en faktisk lokal variant, men punktdensitet, manuellt ritad geometri och exportfilter kan också bidra. Därför visas ingen Knäbäckshusen-differens som verifierad i webappen ännu.

Kontrollpunkten ovan är en geografisk referens för analys, inte en officiell checkpoint-koordinat. De officiella resultatkällorna verifierar kontrollpunktens namn och ungefärliga km-angivelse, men inte en återanvändbar koordinatfil.

## Officiella kontrollpunkter och banankare

Arrangörens aktuella informationssida anger vätske-/dropbagstationer vid Magleberg 44 km, Haväng 79 km och Sandhammaren 131 km. Den anger även reptidsankare vid Snogeholm 30 km, Floen 35 km, Magleberg 43 km, Brösarps backar 71 km, Brösarp väg 75 km, Haväng 80 km, Sandhammaren 131 km och mål 163 km. Detta verifierar namn och källavstånd, men inte historiska koordinater eller att alla avstånd är identiska mellan upplagor. Källa: [arrangörens tävlingsinformation](https://gax100.se/information/).

## Rättigheter och publicering

- Arrangörens sida säger att 2026 års GPX är avsedd för deltagarnavigering och länkar en Garmin-kurs, men ger inte i den här körningen en fristående, arkiverad GPX-fil med explicit återanvändningslicens.
- Garmin Connect visar den offentliga kursen `GAX100M-2026`, 161,45 km, 697 m stigning och 696 m nedför. De dokumenterade exportadresserna `https://connect.garmin.com/proxy/course-service-1.0/{json,gpx,tcx,fit,gpolyline}/course/484861455` svarade i denna körning med HTTP 200, `application/json` och två bytes `{}` för samtliga format; ingen koordinatfil erhölls.
- Plotaroute-rutterna är publika och har GPX-export på rutt­sidan, men upphovsperson och publiceringslicens för återpublicering i GAX100 Analys är inte klarlagd.
- Trace de Trail tillåter enligt sina villkor vissa icke-kommersiella inbäddningar, men det är inte samma sak som rätt att redistribuera GPX-geometri.
- AllTrails-filen behandlas som privat analysunderlag. AllTrails villkor begränsar kopiering, distribution och kommersiell användning.
- Ingen lokal råfil publiceras i GitHub, Pages eller appens nedladdningsyta innan arrangör/upphovsperson har lämnat uttryckligt tillstånd.

## Kartanalysens aktuella capability-status

| Funktion | Status | Orsak |
|---|---|---|
| Lokalt GPX-audit | fullt möjligt | fem läsbara råfiler, hash och geometri-mått är reproducerbara |
| Lokal höjdprofil | delvis möjligt | höjd finns i fem filer, men rättigheter och årskoppling är inte fullständigt verifierade |
| Offentlig historisk kartjämförelse | saknar publiceringsunderlag | ingen fil har klar redistributionsrätt |
| Knäbäckshusen-differens | delvis möjligt | lokal avvikelse är mätt, men officiell banversion och checkpoint-koordinater saknas |
| Individuell GPS-replay | saknar underlag | GPX-filerna är banor, inte deltagarnas tidsstämplade positioner |
| Mellantidsankrad rekonstruktion | delvis möjligt | checkpoint-tider finns i resultatdata, men koordinater måste verifieras separat |

Legends Tracking-värdarna är tekniskt aktiva, men den publika 2026-värden exponerade event-id 2515 som `Tom Avontuur` med nederländska testdata, inte GAX100. De publika dataanropen `/data/event/2515/details`, `/participants_checkpoints` och `/participants_locations` gav därför inget verifierbart GAX-spår. Den äldre `gax100.legendstracking.com` hade inget aktivt masterevent-id i denna körning. RaceTracker 2022 laddade en publik JS-karta med replaykontroller och rätt loppnamn, medan 2021 gav cache-/åtkomsthinder och ingen fristående GPX-export kunde verifieras. Inloggning, tekniska skydd och leverantörsadmin har inte kringgåtts.

## Metod

`node scripts/analyze_gpx.js data/gpx-audit.json` verifierar XML-struktur, hash, koordinater, distans med haversine, höjdintervall, tidsserier, monotonicitet, stora hopp och närhet till Knäbäckshusen. `node scripts/compare_gpx.js 5000` gör en lokal geometrisk jämförelse; den används som diagnostik och inte som ensam källa för officiell banhistorik.
