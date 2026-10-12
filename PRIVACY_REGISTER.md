# GAX100 – integritets- och anonymiseringsregister

## Kontrollstatus 2026-10-12

- Repositoryt innehåller ingen tidigare GAX100-specifik anonymiseringsbegäran, borttagningslista eller person-ID-mappning. Det är en verifierad frånvaro i de tillgängliga projektfilerna, inte ett bevis på att ingen extern begäran kan ha skickats separat.
- Resultatnamn och klubbar ligger i den publika normaliserade exporten eftersom resultatdatabasen uttryckligen bygger på arrangörens publicerade resultat. Rå-HTML, rå-PDF, `raw_json`, SQLite och rå-GPX ligger inte i webbutdata.
- Inga personnamn slås ihop mellan år. Samma textsträng är inte en verifierad personidentitet.
- `web/karta.html` är en noindex-förhandsvisning. GPX laddas via användarens lokala filväljare och råfilerna publiceras inte.

## Före merge/publicering

1. Kontrollera eventuella arrangörs- eller deltagarbegäranden mot aktuell export.
2. Ta bort eller pseudonymisera en specifik person endast efter dokumenterad begäran och med bibehållen källspårbarhet i privat register.
3. Kör `tests/test_public_privacy.js` och granska Pages-artifakten mot slutlig commit.
