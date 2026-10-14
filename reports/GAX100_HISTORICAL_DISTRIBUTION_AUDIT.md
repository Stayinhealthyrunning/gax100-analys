# GAX100 – avgränsad historisk integritetsrevision, 2026-10-14

Revisionen gäller distribution och nåbarhet, inte en ny resultatimport eller ett
juridiskt godkännande. Inga deltagarnamn, deltagar-ID, råkällor eller
patchrader har kopierats till denna rapport. Metoden använder publika
metadata/HEAD-förfrågningar och två lokalt granskade ZIP-strukturer. PR #8
förblir Draft; inga Git-referenser, artefakter eller publiceringar har ändrats.

## Verifierade fynd

| Yta | Verifierat resultat | Begränsning / risk |
|---|---|---|
| Nuvarande publicerad export i full QA | PASS på PR #8-head `cc4aca5`: 945 källresultat, 945 publicerade, 0 träffar mot det privata skyddsregistret; fem Git-versioner av `web/data.json` gav PASS | Detta verifierar aktuella registerregler och datakontrakt, **inte** att alla deltagare är vuxna eller att publicering är rättsligt godkänd. Alla 945 saknar verifierad ålder. |
| GitHub Actions-artefakter | Publikt metadata-API listar **215** aktiva/ej expirerade objekt: 148 `gax100-playwright-qa`, 67 `gax100-snapshot-ui`. **199** skapades före tidsstämpeln för den privata källmigreringscommiten `974700f` (2026-10-14 06:16:51 UTC), 16 efter. Äldsta skapad 2026-10-08; metadata anger förfall 2027-01-06–2027-01-12. | Tidsstämpeln bevisar inte att de 16 senare arkiven är sanerade; de kan avse äldre grenar. Anonymt API-anrop för en äldre ZIP gav HTTP 401, vilket inte fastställer alla möjliga webb-/inloggningsvägar. Behörig nedladdning fungerar. Tidigare raderade/utgångna objekt syns inte. Innehållet i 213 objekt är **inte** granskat. |
| Två äldre artefakter | Objekten `11810897054` (full QA) och `11811076742` (snapshot), båda 2026-10-13, hämtades behörigt. Varje ZIP hade 57 poster: 56 PNG och en HTML-rapport. Inga ZIP-poster hade råarkiv-, verifierad källfil- eller SQLite-sökväg. Tillfälliga lokala ZIP-filer togs bort efter strukturkontrollen. | Bilder och HTML kan fortfarande innehålla publicerade deltagaruppgifter. Ingen innehålls- eller identitetskontroll av alla bilder gjordes; ett rent filnamnsprov är **inte** integritetsfrikännande. |
| Befintlig Pages-sida | `https://www.loppanalys.se/gax100-analys/` och dess `data.json` gav HTTP 200. Den serverade JSON:en var byte-/SHA-256-identisk med det frysta spårade `web/data.json` (14 upplagor, 945 resultat, genererad 2026-10-09), **inte** en ny PR #8-export. `Last-Modified` 2026-10-12 08:07:24 GMT. Startsidan har `noindex, nofollow`; GitHub/Varnish svarade `Cache-Control: max-age=600`. | En äldre offentlig resultatkopia finns alltså fortfarande live. `noindex` och 10 minuters cachetid bevisar inte att äldre index-/CDN-/klientkopior saknas. GAX-repots anonyma Pages-API och deployments-API gav 404, så historisk deploymentlista kunde inte verifieras där. |
| Historisk Pages-körning | Workflow på `main` publicerar enbart `web/` från den äldre `codex/gax100-etapp2`-grenen efter QA. Körning `38214840161` är verifierad som lyckad; dess artifact-API listar inga kvarvarande objekt. | Ingen ny Pages-körning eller publicering har skett i denna revision. Rå transkriptionsfil låg utanför `web/`, men härledda resultat finns i äldre `data.json`. Andra tidigare deploymentversioner och externa kopior är inte fullständigt inventerade. |
| Actions-cache | GitHubs publika cache-API gav HTTP 200 och **0** nu listade cacheobjekt. | Detta säger inget om tidigare raderade cacheobjekt eller oberoende tredjepartscacher. Wayback-tillgänglighetsfrågan avbröts av timeout; ingen slutsats om arkiverade kopior kan dras. |
| Tidigare identifierande 2025-transkription | **NÅBAR.** Publik GitHub Contents-HEAD gav 200 för införandekommitsen `7757cf1` och PR `refs/pull/{2,3,4,5,7}/{head,merge}`. Samma kontroll gav 404 för `main`, PR #6 och #8-head. Publika PR-filmetadata visar dessutom `patch` för transkriptionsfilens tillägg i PR #2 och #5, utan att patchen lästes ut. Objektet är 13 207 byte i lokal Git-historik. Repositoriummet är publikt och har 0 listade forks. | **Bekräftad historisk exponering.** Att filen saknas i aktuellt träd eliminerar inte gamla branch-/PR-refar, diffar, direkta commit-URL:er, kloner eller cachekopior. Inga skyddade personuppgifter återges här. |

## Bedömning och säkra nästa steg

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

Release-gate: PR #8 ska förbli Draft och omergad. Ingen ny produktionspublicering
eller kataloglänk utan uttryckligt beslut efter dessa frågor.
