# BUILD_PLAN.md

## ETAPP 1 – källinventering och reproducerbar grund

1. **Källor och standard** – läs Loppanalys Standard 1.0, skapa källregister och fastställ datamodell.
2. **Resultat 2014–2026** – samla officiella resultat, deltagarstatus, sluttider och eventuella publicerade mellantider.
3. **Mellantider** – normalisera kontrollpunkter (Magleberg, Haväng, Sandhammaren och mål) med år, klass och enhet.
4. **Bana och GPX** – spara metadata för GPX-filer och jämför historiska banbeskrivningar/versioner; separera arrangörens bana från Skåneleden.
5. **Kvalitetssäkring** – kontrollera dubbletter, saknade värden, enheter, årtal och avvikelser mot officiella sidor.
6. **Leverans** – dokumentera analysens första reproducerbara resultat, uppdatera `PROJECT_STATE.md`, commit/push och öppna PR.

## Definition of done för ETAPP 1

- Alla påståenden har källa eller är märkta som ej verifierade.
- Datatäckning och luckor framgår av `DATA_COVERAGE.md`.
- GPX- och banversioner kan särskiljas per år.
- En annan person kan följa källregister och återskapa urvalet.
- PR öppnas men mergas inte utan godkännande.
