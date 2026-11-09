# GAX100 – färdig byggkandidat utifrån Sätila Trail

Uppdaterad 2026-11-09. **Det här är en färdigutvecklad, privat testad GAX-anpassning av Sätilas frontend – inte en GDPR-godkänd offentlig resultatrelease.**

## Repon och versioner

- GAX-sida och analyser: `Stayinhealthyrunning/gax100-analys`, gren `codex/gax100-satila-blueprint-2026-11-09`, PR **#9** (Draft, ej mergad).
- Resultat och import: det **privata** repot `Stayinhealthyrunning/loppanalys-private-data`, `main:gax100/fresh/gax100.sqlite`.
- Datakonvertering och Chromium-QA: privat `gax100/satila_blueprint_adapter.py` och `gax100/qa_blueprint_private.py`. Privat PR #25 och QA-förbättring PR #26 är mergade.
- Ingen offentlig käll-PDF, rå-SQLite, personlig JSON, skärmbildsartefakt eller deltagarexport har lagts till i GAX PR #9.

## Implementerat enligt Sätila-blueprint

- Samma Sätila HTML/CSS/JavaScript och huvudsakliga analyssektioner: översikt, målgångsfördelningar, individuella profiler, jämförelser, delsträckor, historia och resultatdatabas.
- Endast GAX100: 100 miles, **14 upplagor 2014–2026**, med **2021-A och 2021-B** som separata upplagor i val, tabell, historik och delningslänkar.
- 945 normaliserade resultat, 651 fullföljande och 1 838 ursprungliga tidsobservationer. Riktig GAX-data finns **endast i den privata bygg- och testkedjan**, där det vanliga Sätila-formatet genereras i en tillfällig katalog. En tillagd sluttidsobservation per fullföljande skapas från officiellt rapporterad sluttid och redovisas separat från de 1 838 ursprungliga observationerna.
- **2023 års officiella resultatlista är normerande:** 90 resultat / 70 fullföljande, oavsett motstridig introduktionstext från arrangören.
- 2025 PDF: 119 resultat (69 FINISHED, 40 DNF, 10 DNS). 2026 officiell HTML: 110 resultat (66 FINISHED, 33 DNF, 11 DNS).
- Ny GAX-kontrollmodul `docs/assets/gax-controls.js`: faktiska kontrollpassager i valda upplagan; median per kontroll vid n ≥ 5; riktiga ackumulerade klocktider i löparprofiler; A/B-tidsskillnad i direktjämförelse. Inga tidsobservationer eller geografiska positioner interpoleras. Kontrollernas visningsordning följer medianen av verkliga passertider när den finns; det är en presentationssortering, inte GPS-bevis.
- Årsspecifik GPS-rutt, höjdprofil och kartanimation kräver verifierad geometri och användningsrätt. Alla GAX-upplagor saknar just nu sådan publik, rättighetsklar geometri; kartreplay ska därför vara spärrat.
- Fysisk delsträckefart och helbanetempo är spärrade när kilometerdistansen inte är verifierad. Den nominella konverteringen 100 miles ≈ 160,934 km är **inte** en uppmätt GPX-längd.
- Den publika förhandsgrenen visar endast aggregerad historik och tydliga integritetsspärrade tomlägen. **Inga individuella GAX-resultat ligger i dessa 14 publika JSON-filer.**

## Reproducerade tester

1. Privat verklig resultat-QA (Chromium, GAX-källa via privat SQLite): [Actions 42607597449](https://github.com/Stayinhealthyrunning/loppanalys-private-data/actions/runs/42607597449) – **PASS**. Kontrollerar 14 upplagor, verkliga resultatposter, 2021-A/B, individuell profil, checkpointpanel, två löpare och jämförelse samt mobil 390 px / desktop 1440 px.
2. Public blueprint/privacy/syntax-QA: [GitHub Actions](https://github.com/Stayinhealthyrunning/gax100-analys/actions/workflows/gax-blueprint-qa.yml). Kör på PR #9 och bevisar att inga personposter eller gamla rådatabaser finns i de publicerbara HTML/JSON-filerna.
3. Full privat import 2014–2026: [Actions 42590244783](https://github.com/Stayinhealthyrunning/loppanalys-private-data/actions/runs/42590244783) – **PASS**, 14 upplagor, 945 resultat och 1 838 tidspassager.

## Releasegrind, ännu inte godkänd

Följande måste klaras **före** faktisk publicering av deltagarnamn/resultat:

1. Dokumenterad rättslig grund för separat offentlig resultat- och individanalys, deltagarens förväntningar, rättelse och invändning.
2. Verifierad hantering av okänd ålder: samtliga 945 källresultat saknar verifierat åldersfält. Okänd ålder får inte behandlas som bekräftat vuxen.
3. Ett privat GDPR-/spärrregister med automatisk filtrering **före** utläggning av publika filer, plus revision som visar att spärrade identiteter saknas.
4. Särskilt beslut om publiceringsnivån (identifierbara resultat eller endast aggregerad/avidentifierad presentation) och en reproducerbar granskad exportprocess.
5. GitHub Supports historiska PR/cache-sanering #4858695 hanteras separat från nyimporten.
6. Slutlig exact-head-regression och faktiskt godkännande innan PR #9 mergas, Pages aktiveras eller GAX länkas från Loppanalys.se.

**Gör ingen automatisk merge eller Pages-deploy från den här grenen.** Resultat i det privata repot är personuppgifter och ska inte kopieras till öppna CI-loggar, publika PR-kommentarer, nedladdningsartefakter eller Github Pages.
