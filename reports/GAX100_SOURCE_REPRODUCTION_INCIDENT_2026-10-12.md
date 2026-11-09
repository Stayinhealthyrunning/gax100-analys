# GAX100 – incident i automatisk källhämtning och säkrad byggrutin

Datum: 2026-10-12 · Gäller enbart separat arbetsbranch Draft PR #3. Inga ändringar i publicerade tävlingsresultat eller rättighetsregister.

## Vad som hände

I Actions-körningen [38270718958](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38270718958) returnerade arrangörens HTML-endpoints **HTTP 200 och nedladdningsstatus `downloaded`**, men deras innehåll var cirka 12 kB, saknade `DNF`, `Magleberg`, `Haväng` och resultatstrukturer. Importen skapade **1 upplaga, 119 resultat och 0 observationer** från den kontrollerade 2025-PDF-transkriptionen. Den gamla `audit_sources.ps1` rapporterade 16 nedladdningar trots att HTML var semantiskt oanvändbar. Den befintliga `test:plan` stoppade bygget av en slump först senare.

En senare strikt källkörning [38271264578](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38271264578) återfick kompletta källsidor och verifierade **14 upplagor, 945 resultat och 1 838 mellantider**. Detta visar en *intermittent* käll-/anti-bot-situation, inte en verifierad permanent webbplatsändring. Det går inte att dra slutsatser om orsaken på servernivå från HTTP-loggen ensam.

## Implementerad säkring

1. `scripts/verify_source_integrity.js` kräver samtliga äldre års HTML och relevanta PDF-filer, kontrollerar SHA-256, PDF-signatur, tydlig resultatstruktur och indikationer på bot/interstitial. Ett HTTP 200 är aldrig ensamt tillräckligt.
2. Live-QA kör källgaten **före** databaskonstruktion och export. Underkänd källa stoppar bygget, i stället för att dölja bristen som en lyckad import.
3. `scripts/export_web_data.js` jämför sanerad payload mot den frysta releasebasen 14 editions, 945 resultat och 1 838 tidsobservationer **före** skrivning. Avvikelse ger fel och befintlig `web/data.json` behålls; giltig fil uppdateras genom temporär fil + atomisk rename.
4. `tests/test_source_integrity.js` simulerar både lyckad verifierad källa och HTTP-200-botchallenge, felstatus, ofullständig export samt dubblett-ID.
5. `.github/workflows/snapshot-qa.yml` testar den frysta, redan verifierade webbdatan separat från livekällan. **En grön snapshot-QA är endast UI-regressionsbevis, aldrig publicerings- eller importbevis.** Det ordinarie liveflödet måste också vara grönt och ha godkänt källgaten innan ett nytt databasbygge kan betraktas som reproducerbart.

## Kvarvarande beslut

- För närvarande låst exportbas **14/945/1838**. Framtida legitima nya resultat kräver först verifierad källa, curator-QA och en uttrycklig uppdatering av referensmatris/testbas. Höj aldrig dessa förväntningar automatiskt från okontrollerade liveanrop.
- Exakt head ska testas i båda flödena. GitHub Pages/publiceringsflödet och slutlig anonymiserings-/GDPR-grind måste kontrolleras separat; detta är ingen release eller merge.
- Om arrangörens tillgång blir varaktigt blockerad krävs ett explicit godkänt och integritetsgranskat fryst källarkiv för reproducerbar import, inte en dold automatisk fallback.
