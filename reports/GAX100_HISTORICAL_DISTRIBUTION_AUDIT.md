# GAX100 – historisk integritetsrevision och saneringsuppföljning, 2026-10-14

## Aktuellt läge efter ägargodkänd sanering (2026-10-14)

Det privata ägarbeslutet i ärende #7 godkände uttryckligen en avgränsad
GAX100-sanering. Följande är genomfört utan deltagaruppgifter eller känsliga
patchrader i denna offentliga rapport:

| Kontroll | Verifierat resultat | Återstående gräns |
|---|---|---|
| Privat bevarande | Privat källrepo på `a56fd488a6e3cf7263753f975ff8427b8f4dd8cf`: manifest och samtliga **17/17** filer verifierades mot byteantal/SHA-256. Den riktiga restore-rutinen kopierade 17/17 och verifierade kopiorna igen. En komplett före-sanering-bundle med 9 grenar och 15 PR-refar verifierades, SHA-256 `79EB64F9574A1912C86555CBFBA19DCE7449C7416D5F7C9B55B1212E4F1B5A74`, krypterades lokalt med Windows DPAPI och provdekrypterades mot samma hash. Okrypterad bundle togs bort. | DPAPI-kopian i ignorerad lokal katalog är bunden till detta Windows-konto; oberoende/offsite krypterad backup är **inte** verifierad. Privat originalarkiv är oförändrat. |
| GAX100 Pages | Enbart GAX100-workflow `379338869` inaktiverades (`disabled_manually`), varefter Pages-sajten i GAX100-repot raderades: DELETE 204, API GET 404. Efter tidigare Varnish-cacheutgång gav kanoniska `/`, `/index.html` och `/data.json` **HTTP 404**; huvudportalen `/` gav fortsatt HTTP 200. Samma 404 och inaktiverad konfiguration verifierades efter grenpusharna. | Äldre externa cache-, sökindex- och klientkopior kan inte avfärdas genom detta. Ingen ny filtrerad Pages-release gjordes. |
| Git-historik | Nio offentliga grenar, inga taggar. Sju grenar och PR #2–8 hade den skyddade filen i sin historik; PR #6/#8:s senaste träd var redan rena. `git-filter-repo` v2.47.0 kördes isolerat med `--sensitive-data-removal`, exakt skyddad sökväg och revisionsintervall som bevarade ren bas. **First Changed Commit** `7757cf18608002859745c66d6a016eaa6d8bcdce`; 21 ändrade refar (7 grenar, 7 PR-heads, 7 PR-merge-refar) lokalt. En atomisk push med exakta `force-with-lease`-SHA uppdaterade endast de sju grenarna. | GitHub-ägda PR-refar kan inte skrivas av oss; Support behöver granska dem samt direkta commit-URL:er och diffcache. |
| Oberoende fjärrverifiering | Efter färsk fetch från GitHub: **9/9** vanliga gren-/tagghistoriker utan skyddad sökväg och utan nåbarhet för den gamla Git-blobben. `main` och PR #1 behöll sina ursprungliga SHA. PR #8:s Git-träd är identiskt före/efter omskrivningen och dess merge-base mot `main` oförändrad. PR #8 är fortsatt öppen, Draft, omergad på `8b9a8880b0d8b038ebebfe6457c82bd85baf2598`. | Publik HEAD-metadata gav fortfarande 200 för introduktionscommitten och `refs/pull/3/merge`, 404 för PR #8:s aktuella branchträd. Vid kontrollen var just PR #3:s GitHub-ägda merge-ref den enda kvarvarande PR-refen vars historik nådde filen. PR #2/#5:s äldre patch-/diffcache kan också finnas kvar. |
| QA på sanerad PR #8-head | [Full QA #38599843065](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38599843065): success, 17/17 privat restore, 945 resultat/1 838 observationer, 51/51 Chromiumtester och administrativ exportaudit. [Snapshot-QA #38599842934](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38599842934) och [privacy guard #38599842956](https://github.com/Stayinhealthyrunning/gax100-analys/actions/runs/38599842956): success på samma SHA. | Dessa tester avgör varken deltagarnas okända ålder, rättslig publiceringsgrund eller historiska externa kopior. Dokumentationscommit efter denna SHA behöver egna checks. |
| Actions-artefakter | Den tidigare baslinjen **215** har ökat genom nya QA-körningar. Full metadataomläsning 2026-10-14 16:43 UTC: **223** aktiva, 151 `gax100-playwright-qa-*`, 72 `gax100-snapshot-ui-*`, 0 utgångna, totalt 2 843 883 244 byte; 199 skapade före privata källmigreringens tidsstämpel och 24 efter. De två tidigare provade äldre ZIP:arna (`11810897054`, `11811076742`) finns kvar; endast deras struktur (57 poster vardera) har granskats. **221** arkivs innehåll är inte granskat. | Ingen artefakt har raderats. PNG/HTML kan innehålla publicerade deltagaruppgifter även när råfiler saknas som ZIP-poster. Behörig ägare måste besluta selektiv innehållsgranskning, bevarande/retention och eventuell radering före förfall 2027-01-06–12. |

Support-underlaget är uppdaterat i `GAX100_GITHUB_SUPPORT_CASE_DRAFT.md` men
**inte skickat**. Historikomskrivning av vanliga grenar är inte detsamma som
fullständig plattformsradering. Kloner, externa arkiv, Actions-bilder och
direkta SHA-/PR-diffvägar återstår att hantera med behörig process. Teknisk
GDPR-filtrering (0 träffar mot aktuellt privat register i full QA) är separat
från juridiska beslut om ålder, rättslig grund och återanvändningsrätt. Okänd
ålder förblir okänd; GPX/replay förblir spärrade. Ingen merge, ny produktionsexport
eller katalogpublicering är godkänd.

## Baslinje före saneringen (historisk; inte aktuellt driftläge)

Revisionen gäller distribution och nåbarhet, inte en ny resultatimport eller ett
juridiskt godkännande. Inga deltagarnamn, deltagar-ID, råkällor eller
patchrader har kopierats till denna rapport. Metoden använder publika
metadata/HEAD-förfrågningar och två lokalt granskade ZIP-strukturer. PR #8
förblir Draft; inga Git-referenser, artefakter eller publiceringar har ändrats.

### Verifierade fynd före saneringen

| Yta | Verifierat resultat | Begränsning / risk |
|---|---|---|
| Nuvarande publicerad export i full QA | PASS på PR #8-head `cc4aca5`: 945 källresultat, 945 publicerade, 0 träffar mot det privata skyddsregistret; fem Git-versioner av `web/data.json` gav PASS | Detta verifierar aktuella registerregler och datakontrakt, **inte** att alla deltagare är vuxna eller att publicering är rättsligt godkänd. Alla 945 saknar verifierad ålder. |
| GitHub Actions-artefakter | Publikt metadata-API listar **215** aktiva/ej expirerade objekt: 148 `gax100-playwright-qa`, 67 `gax100-snapshot-ui`. **199** skapades före tidsstämpeln för den privata källmigreringscommiten `974700f` (2026-10-14 06:16:51 UTC), 16 efter. Äldsta skapad 2026-10-08; metadata anger förfall 2027-01-06–2027-01-12. | Tidsstämpeln bevisar inte att de 16 senare arkiven är sanerade; de kan avse äldre grenar. Anonymt API-anrop för en äldre ZIP gav HTTP 401, vilket inte fastställer alla möjliga webb-/inloggningsvägar. Behörig nedladdning fungerar. Tidigare raderade/utgångna objekt syns inte. Innehållet i 213 objekt är **inte** granskat. |
| Två äldre artefakter | Objekten `11810897054` (full QA) och `11811076742` (snapshot), båda 2026-10-13, hämtades behörigt. Varje ZIP hade 57 poster: 56 PNG och en HTML-rapport. Inga ZIP-poster hade råarkiv-, verifierad källfil- eller SQLite-sökväg. Tillfälliga lokala ZIP-filer togs bort efter strukturkontrollen. | Bilder och HTML kan fortfarande innehålla publicerade deltagaruppgifter. Ingen innehålls- eller identitetskontroll av alla bilder gjordes; ett rent filnamnsprov är **inte** integritetsfrikännande. |
| Befintlig Pages-sida | `https://www.loppanalys.se/gax100-analys/` och dess `data.json` gav HTTP 200. Den serverade JSON:en var byte-/SHA-256-identisk med det frysta spårade `web/data.json` (14 upplagor, 945 resultat, genererad 2026-10-09), **inte** en ny PR #8-export. `Last-Modified` 2026-10-12 08:07:24 GMT. Startsidan har `noindex, nofollow`; GitHub/Varnish svarade `Cache-Control: max-age=600`. | En äldre offentlig resultatkopia finns alltså fortfarande live. `noindex` och 10 minuters cachetid bevisar inte att äldre index-/CDN-/klientkopior saknas. GAX-repots anonyma Pages-API och deployments-API gav 404, så historisk deploymentlista kunde inte verifieras där. |
| Historisk Pages-körning | Workflow på `main` publicerar enbart `web/` från den äldre `codex/gax100-etapp2`-grenen efter QA. Körning `38214840161` är verifierad som lyckad; dess artifact-API listar inga kvarvarande objekt. | Ingen ny Pages-körning eller publicering har skett i denna revision. Rå transkriptionsfil låg utanför `web/`, men härledda resultat finns i äldre `data.json`. Andra tidigare deploymentversioner och externa kopior är inte fullständigt inventerade. |
| Actions-cache | GitHubs publika cache-API gav HTTP 200 och **0** nu listade cacheobjekt. | Detta säger inget om tidigare raderade cacheobjekt eller oberoende tredjepartscacher. Wayback-tillgänglighetsfrågan avbröts av timeout; ingen slutsats om arkiverade kopior kan dras. |
| Tidigare identifierande 2025-transkription | **NÅBAR.** Publik GitHub Contents-HEAD gav 200 för införandekommitsen `7757cf1` och PR `refs/pull/{2,3,4,5,7}/{head,merge}`. Samma kontroll gav 404 för `main`, PR #6 och #8-head. Publika PR-filmetadata visar dessutom `patch` för transkriptionsfilens tillägg i PR #2 och #5, utan att patchen lästes ut. Objektet är 13 207 byte i lokal Git-historik. Repositoriummet är publikt och har 0 listade forks. | **Bekräftad historisk exponering.** Att filen saknas i aktuellt träd eliminerar inte gamla branch-/PR-refar, diffar, direkta commit-URL:er, kloner eller cachekopior. Inga skyddade personuppgifter återges här. |

### Tidigare bedömning och säkra nästa steg

1. **Prioriterat ägarbeslut:** Klassificera den äldre transkriptionen och
   Pages-kopian med integritetsansvarig/jurist. Den tekniska kontrollen med
   0 registerträffar är inte en åldersbedömning, rättslig grund eller
   återanvändningslicens. Okänd ålder förblir okänd. GPX-/replayrättigheter är
   ett separat beslut; de geografiska funktionerna ska fortsatt vara spärrade.
2. **GitHub Support-beredskap:** Använd
   [ärendeutkastet](GAX100_GITHUB_SUPPORT_CASE_DRAFT.md) och samordna eventuell
   känslig-data-sanering med ägare. [GitHubs egen vägledning](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
   anger att historikomskrivning ensam inte tar bort PR-refar eller cachade
   vyer, och att Support kan behövas efter en koordinerad sanering. Ingen
   force-push, ref-radering, PR-stängning eller Support-kontakt är gjord.
3. **Artefakter:** En behörig ägare bör avgöra om de 199 äldre objekten ska
   innehållsgranskas eller raderas enligt beslutad retention. [GitHub anger](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/remove-workflow-artifacts)
   att artefaktradering inte kan ångras. Ingen massradering rekommenderas utan
   bevarandebeslut och säkerhetskopierad revisionslogg.
4. **Pages/cache:** Fatta separat beslut om den befintliga äldre publiceringen
   ska avpubliceras eller ersättas med godkänd version. Kontrollera därefter
   faktisk distribution, sökindex och eventuella externa arkiv med behörig
   process. Anonyma Pages-API-svar 404 och timeout från Wayback är
   **okontrollerat**, inte PASS.

Historisk release-gate: PR #8 skulle förbli Draft och omergad. Detta gäller
fortsatt; de ovanstående uppföljningsfynden ersätter däremot den dåvarande
uppgiften om live Pages och osanerade vanliga grenar.
