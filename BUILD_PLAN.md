# BUILD_PLAN.md

## ETAPP 1 – inventering och källverifiering (aktuell leverans)

1. **Standard** – läs hela `LOPPANALYS_STANDARD_V1_0.md` via GitHub-klon och registrera normerande status.
2. **Resultatindex** – inventera varje verklig upplaga 2014–2026, inklusive två 2021-upplagor.
3. **Fältmatris** – dokumentera FINISHED/DNF/DNS, kön, klubb, sluttid, mellantider och kontrollpunkter utan fabricering.
4. **Bana/GPX** – inventera officiella länkar, autentiska spår och banändringen vid Knäbäckshusen 2024.
5. **Åtkomst/proveniens** – registrera filformat, URL, åtkomsthinder och skillnaden identifierad/verifierad/nedladdad/normaliserad.
6. **Genomförbarhet** – bedöm standardblock och lämna tydliga blockerare för ETAPP 2.

## ETAPP 2 – hämtning, arkivering, import och normalisering

1. Ladda ned officiella HTML/PDF/resultatfiler och autentiska GPX där åtkomst och publiceringsrätt är verifierad.
2. Arkivera råfiler med URL, hämtad tidpunkt och SHA-256; ändra inte originalfält.
3. Importera till kuraterad tabell med source-scoped edition/result-ID och fältproveniens.
4. Normalisera status, kön, klubb, tider och kontrollpunkter; bevara råvärden och markera osäkerheter.
5. Jämför GPX/banversioner före och efter 2024 utan att anta geometrisk jämförbarhet.
6. Kör counts/status/QA mot officiella sidor och exportera endast verifierade fält till webblagret.
7. 2025 är nu importerat från arrangörens officiella PDF via `data/verified/result-2025-official.json`; fixture-filen är en spårbar transkription, inte en ersättning för original-PDF:en.

### ETAPP 2B – datakvalitet och verifierad interaktion

SQLite-importen är implementerad i `scripts/build_database.js`. Den är idempotent och skiljer editions, resultat och tidsobservationer. Äldre tidsformat med rangsuffix är parserade utan att rangvärdet påverkar klocktiden; tidskronologin valideras per resultat. Frontendens mobilresultat, kvalitetstabell, individuell segmentfart, jämförbara kontrollpunkter och historisk referens/simulering är underlagsstyrda. Kartduellens valkontrakt är aktivt, medan deltagarreplay och officiell återpublicerad årsgeometri är separata gated capabilities.

## ETAPP 3 – verifierad analysprodukt

1. Kör full Chromium-QA vid 1440, 900, 768 och 390 px och granska artefakterna visuellt.
2. Färdigställ only-if-verified standardblock: resultatöversikt, individuell analys, jämförbara mellantider och percentiler.
3. Hämta/arkivera 2023/2024/2026-GPX först efter årsanknytning och rättighet; håll lokal forskningspreview skild från publicerat webblager.
4. Aktivera höjdprofil, banjämförelse, mellantidsankrad position och GPS-replay var för sig utifrån respektive datakrav.
5. Publicera inte nya GAX100-geometrier eller lägg till loppet i huvudkatalogen utan separat godkännande.

## Definition of done för ETAPP 1

- Alla påståenden har källa eller är märkta som ej verifierade.
- Datatäckning och luckor framgår av `DATA_COVERAGE.md`.
- GPX- och banversioner kan särskiljas per år.
- En annan person kan följa källregister och återskapa urvalet.
- PR öppnas men mergas inte utan godkännande.
