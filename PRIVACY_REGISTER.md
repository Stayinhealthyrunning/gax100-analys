# GAX100 – integritets- och anonymiseringsregister

## Kontrollstatus 2026-10-12

- Repositoryt innehåller ingen tidigare GAX100-specifik anonymiseringsbegäran, borttagningslista eller person-ID-mappning. Det är en verifierad frånvaro i de tillgängliga projektfilerna, inte ett bevis på att ingen extern begäran kan ha skickats separat.
- GAX100 använder nu den gemensamma åtkomstbegränsade schema-2-registret via `scripts/public_privacy.js`. **I den aktuella `scripts/export_web_data.js` tas hela spärrade resultatrader inklusive tillhörande observationer bort ur `web/data.json`**, inte enbart namn och klubb. Exporten kräver det privata registret och stoppar publicering om det saknas eller innehåller en ny ej godkänd identitetsträff. `tests/test_public_privacy.js` verifierar skydden. Registret och fingeravtrycken publiceras inte.
- Namn och klubb exponeras för **icke spärrade vuxna eller deltagare med okänd ålder** i publika resultat på grundval av arrangörens offentliga resultatuppgifter. Verifierade minderåriga och godkända identitetsspärrar utesluts från publicerad individexport. Rå-HTML, rå-PDF, `raw_json`, SQLite och rå-GPX exporteras inte till webben. **Alla 945 källresultat saknar tillförlitligt åldersunderlag**, varför ungdomsskyddet inte kan beskrivas som en total åldersgaranti; GAX100 hålls som Draft tills separat publiceringsbeslut fattats.
- Inga personnamn slås ihop mellan år. Samma textsträng är inte en verifierad personidentitet.
- Både `web/index.html` och `web/karta.html` är nu `noindex, nofollow` i det serverlevererade HTML-dokumentet. `web/karta.html` GPX laddas via användarens lokala filväljare och råfilerna publiceras inte.

## Före merge/publicering

1. Kontrollera eventuella arrangörs- eller deltagarbegäranden mot aktuell export.
2. Kontrollera att tidigare beviljade identitetsspärrar tillämpas i GAX100 och varje nytt lopp med verifierad källidentitet; uteslut hela skyddade individraden. Rapportera osäker ålder öppet, gissa inte vuxenstatus och tillåt ingen automatisk publicering utan privat register.
3. Kör `tests/test_public_privacy.js` och granska Pages-artifakten mot slutlig commit.

4. Utvärdera att den delade fingerprint-listan och hanteringen av inkomna rättighetsbegäranden ska skötas från en **åtkomstskyddad** central källa i stället för fördelade publika repositorykonfigurationer; publika namnhashar kan utsättas för gissningsattacker.
