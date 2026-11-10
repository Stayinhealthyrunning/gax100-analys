# GAX100 Analys – Sätila som blueprint

**Status 2026-11-09: endast källkod och aggregerad förhandsvy. INGEN offentlig export av deltagaruppgifter.**

Detta är en separat kodgren skapad från GAX100 `main` och använder den faktiska Sätila `docs/index.html`, `docs/assets/app.js`, profil- och jämförelsemodulerna och samma CSS som layout- och funktionell blueprint. Endast eventidentitet, distans-/upplageselektion, banningsrättigheter och datamodell skiljer sig.

- GAX: 100 miles, 14 editioner 2014–2026, inklusive två separata 2021 A/B.
- **Norm för 2023:** officiell resultatlista, 90 resultat och 70 FINISHED; inte arrangörens löptext.
- Publik `docs/data/races/*.json` är avsiktligt **tomma placeholders**, **inte** individuella resultat eller verifierad release. Därför är offentligt gränssnitt **inte** en färdig analysprodukt.
- Fullständiga GAX-resultat, riktiga kontroller och deras exakta observationer konverteras i privat Actions-körning från nya `loppanalys-private-data/main:gax100/fresh/gax100.sqlite` till identisk Sätila-jsonmodell **endast i temporär privat byggmiljö**, utan uppladdning/publicering.
- Position, replay, banprofil och 2–5-kartduell är dataspärrade utan rättighetsklar års-GPX och kontrollkoordinater. Kontrolltid och jämförelse fungerar när källan har observerade passager.
- Verifierad ålder saknas för GAX; namn/publicerad export förblir blockerad tills GDPR/suppression/rättslig grund är dokumenterat godkända.
- Sätilas foton och soundtrack är inte kopierade. Hero är en separat CSS-baserad GAX-version utan tredje parts bild.
- GAX100 PR #8 och dess historiska GitHub-sanering påverkas inte av denna gren. Ingen ny rådata finns i aktuell offentlig kod, men grenen är skapad från Git-historik som fortfarande kan kräva GitHub Supports sanering.

Efter fullt godkännande genererar den privata pipelinen publik JSON från den verifierade, filtrerade källan; den ska aldrig kopiera raw SQLite, raw HTML/PDF eller okontrollerade personuppgifter till denna publika gren.
