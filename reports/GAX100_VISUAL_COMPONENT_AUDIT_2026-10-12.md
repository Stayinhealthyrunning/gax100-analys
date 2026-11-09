# GAX100 – oberoende visuell komponentgranskning, 2026-10-12

## Vad som kontrollerats – och vad som inte har det

Det ursprungliga påståendet att hela appen var visuellt slutgranskad var **för brett**. Den äldre QA:n hade 15 namngivna interaktionstester och helsidesbilder vid 1536, 1440, 1200, 1024, 900, 768, 390 och 360 px, men responsivbilderna var huvudsakligen från 2026 med standardval – alltså **utan aktiverade individuella analyser, jämförelser och loppplaner**.

Som korrigering har vi lagt till `tests/e2e/visual-parity.spec.js`, som sparar **nio separata bilder av verkligt aktiverade användarflöden vid 390 och 1440 px**: sökning, vald löpare, jämförelse, bytt A/B, loppplan, fältstatistik, segmentlabb, datalucka och resultatdatabas. Både interaktion och horisontell sidbredd testas. Bilderna kräver fortfarande mänsklig visuell bedömning: PASS i Playwright är inte ett pixel-paritetsbevis.

Normkällan är `Stayinhealthyrunning.github.io/standards/LOPPANALYS_STANDARD_V1_0.md`; de fyra referenssystemen är Ultravasan, Gotaleden, ÖST och Sätila. Fullständig pixel-för-pixel-granskning mot de fyra systemen, inklusive alla deras valda tillstånd, är **inte genomförd**.

## Visuell och funktionell komponentmatris

| Komponent | Evidens | Resultat och avvikelser |
|---|---|---|
| Header / upplaga | 390/1440 samt standardvyer 360–1536 | Upplageval och portalnavigering fungerar; färgkontrast godkänd i bild. Egen löparhero saknas, så standardparitet uppnås inte. |
| Fem faktakort | Desktop och mobil, 2021/2026 | Fem kort på stor skärm, kompakta på mobil. Kön redovisas källstödd med separata median-/medelvärden, män blå och kvinnor rosa. |
| Hitta din löpare | Ny skärmbild med sökträff 2023 vid 390/1440 | Söktext ger rätt namngivet resultat, år, kön, klubb, status, sluttid samt knappar Öppna/Jämför/Kartduell/Favorit/Dela. Selektion leder till rätt individ. Första standardsidan utan inmatning visar inga valbara sökträffar; det är avsiktligt. Native dropdowns har testats med Playwright men inte granskats manuellt öppna på varje operativsystem. |
| Individuell analys | Aktiverad 2023 + 2021, mobil/desktop | Start och verifierade passager, delsträcketid, hastighet, kumulativ medianlucka, markerbara intervall. **Visuell defekt upptäckt:** tabellrubriker och tider delades på mobil. Åtgärdad med läsbara mobilkort och tydliga fältetiketter. SVG-diagrammens skrift/axlar är fortfarande små på 390 px – förbättring kvarstår. |
| Direktjämförelse 2.0 | Två valda fullföljare och A/B-byte 390/1440 | Två resultatkort, verifierad tidsgraf och mellanpassageskillnad. **Defekter upptäckta:** för många tabellkolumner på mobil och könsstridig A/B-färgkodning. Mobilkort införda. Source-reported Kön styr nu blå/rosa; A heldragen, B streckad. Ingen GPS-kartreplay. |
| Kartduell | Val 2–5, gating | Urval och informationsläge kontrollerade i e2e, men faktisk geografisk Kartduell/replay saknas. Därför ingen funktionsparitet med de andra systemen. |
| Personlig loppplan | Aktiverad simulator, 24:00:00, 390/1440 | Referenskohort, +/-5/15, medianreset och exakt summering testade. **Visuell defekt upptäckt:** sju kolumner blev sönderbrutna på mobil. Åtgärdad med 7 läsbara mobilfält per segment. |
| Sluttidsfördelning / percentiler | Diagram och kvinna/man-urval | Grupper n-gated, blått/rosa per kön, histogramintervallet klickbart och percentilval kopplat till mål. Histogrammet har smal text på mobil; zoom/klickytor behöver ytterligare utvärdering. |
| Tid mot placering | Källpublicerad rank, vald löpare via överlappad graf | Axlar och separata valbara punkter kontrollerade. Kompletterande dropdown tillåter val när punkter överlappar. Inga syntetiska placeringar. |
| Vad räcker tiden till? | Inmatning och återställning | Retrospektiv ungefärlig placering/andel fungerar i test, märkt som estimat. |
| Utökad fältstatistik | Årsval 2023–2026 | Delsträcke-kohort, DNF-observationer, snabbaste slutsegment, kön/klubb. Kapabilitetsblock utan underlag är tydligt inaktiverade, men defaultåret 2026 får många texttunga tomlägen och blir visuellt långt. |
| Delsträckelabbet | Kontroller 44→80 km 2023, män/kvinnor, n-gating | Förval, Från/Till, könsdropdown och återställning testade. Mobilpresentation med tydliga separata kort visuellt god. 2024 saknar verifierat avstånd, 2025/2026 segmentdata. |
| Historisk jämförelse | Fullbild mobil | **Defekt upptäckt:** sex tabellkolumner kapades/sönderbröts på 360–390 px. Ändrad till separata mobilkort med namngivna fält. |
| Datakvalitet / metodik | Statisk helsidesvy och kod | Källdatamatriser finns; tabellen kräver avsiktlig sidledes rullning på små skärmar, inte fullt jämställd med andra system. Hjälptexter finns men full keyboard/screenreader-revision saknas. |
| Resultatdatabas | Aktuell paginering och mobil-390 | 10/25/50 rader, återställning, sortering och synlig radräknare testade. Alla resultathandlingar är inte manuellt verifierade på varje skärmstorlek. |

## Kritiska skillnader som består

1. **GPS och geografisk replay:** GAX100 saknar offentlig verifierad årsgeometri, checkpoint-koordinater, interaktiv höjdprofil, följkamera, musik och faktisk Kartduell. Det är en käll- och licensgrind, inte något som får lösas med hypotetisk geometri.
2. **Designparitet:** bildbaserad hero, bilddelning/OG och flera av referenssystemens finjusterade diagraminteraktioner saknas. Tablet-/mobilvyer av samtliga aktiva lägen har inte jämförts pixel-för-pixel med vart och ett av de fyra systemen.
3. **Diagramläsbarhet:** responsiva tabeller förbättrades efter granskningen, men flera SVG-axlar har fortfarande liten typografi på mobil. Detta kräver egen interaktiv grafikrevision.
4. **Tillgänglighet:** browserautomation verifierar en del tangentbords- och kontrollhandlingar, men systematisk WCAG 2.2 AA, skärmläsare, 200 % zoom samt native select i Safari/Firefox/iOS/Android är inte verifierade.
5. **GDPR:** inga nya individbaserade segmenttopplistor publiceras av detta arbete. Slutlig kontroll av minor/opt-out, sammanslagning och publicerade historiska artefakter återstår och måste ske separat före merge.

## Åtgärder inom denna granskning

- Nytt tvåstorleks-Playwright-test med 18 skärmbilder av *aktiva* analyslägen.
- Enhetligt mobilt kortrenderingskontrakt för personlig loppplan, jämförelse, individuella splits och kumulativ tidslucka, med cell-etiketter även för hjälpmedel.
- Mobilkort för historisk jämförelse och test att alla sex fälten kan läsas utan sidbreddsöverskridning.
- Könssemantisk färgsättning i jämförelse och skillnad i linjestil för A/B, utan härledning av kön från namn.
- Befintliga regressioner, privacy och källtäckning behållna. QA måste alltid vara grön på **exakt slut-HEAD**.

**Releasebeslut: NEJ – behåll Draft PR #3.** Funktionalitet och skärmbilder är delvis verifierade men uppfyller ännu inte krav på total paritet eller färdig GDPR-grind. Ingen ändring av officiella resultat eller produktionspublicering görs här.
