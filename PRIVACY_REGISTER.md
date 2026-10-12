# GAX100 – integritets- och anonymiseringsregister

## Kontrollstatus 2026-10-12

- Repositoryt innehåller ingen tidigare GAX100-specifik anonymiseringsbegäran, borttagningslista eller person-ID-mappning. Det är en verifierad frånvaro i de tillgängliga projektfilerna, inte ett bevis på att ingen extern begäran kan ha skickats separat.
- GAX100:s publika export använder nu samma publika name-fingerprint-spärrkonfiguration som fyra andra analyssystem via `config/privacy-suppressions.json` och `scripts/public_privacy.js`. Spärren tillämpas innan `web/data.json` skrivs. Namn visas då som Anonym löpare, klubb rensas och publikt result-ID ersätts av en opaque nyckel. Tävlingsprestationer kan fortfarande vara indirekt identifierbara: detta är pseudonymisering, inte garanterad GDPR-anonymisering.
- Namn och klubb exponeras fortfarande för **icke spärrade resultat** i den publika normaliserade exporten eftersom resultatdatabasen bygger på arrangörens publicerade resultat. Rå-HTML, rå-PDF, `raw_json`, SQLite och rå-GPX ligger inte i webbutdata. En begäran om full radering av all hänförbar information kräver separat utredning och eventuell fullständig borttagning av berörda resultatrader ur publiceringen.
- Inga personnamn slås ihop mellan år. Samma textsträng är inte en verifierad personidentitet.
- Både `web/index.html` och `web/karta.html` är nu `noindex, nofollow` i det serverlevererade HTML-dokumentet. `web/karta.html` GPX laddas via användarens lokala filväljare och råfilerna publiceras inte.

## Före merge/publicering

1. Kontrollera eventuella arrangörs- eller deltagarbegäranden mot aktuell export.
2. Kontrollera att tidigare beviljade identitetsspärrar tillämpas i GAX100 och varje nytt lopp. Gör en separat rättslig prövning om full radering krävs; befintlig pseudonymisering garanterar inte att prestationen inte kan kopplas till personen.
3. Kör `tests/test_public_privacy.js` och granska Pages-artifakten mot slutlig commit.

3. Utvärdera att den delade fingerprint-listan och hanteringen av inkomna rättighetsbegäranden ska skötas från en **åtkomstskyddad** central källa i stället för fördelade publika repositorykonfigurationer; publika namnhashar kan utsättas för gissningsattacker.
