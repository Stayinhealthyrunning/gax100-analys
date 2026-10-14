# Aktivera privat GDPR-publiceringsregister (operatörsinstruktion)

**Körs endast lokalt av behörig administratör.** Det privata JSON-registret ska ligga
utanför alla publika Git-repositories, utan klartextidentiteter. Ange aldrig
registrets innehåll eller dess Base64-värde i ChatGPT, PR, issue, terminalargument,
Actions-loggar eller filer under projektets arbetskatalog.

1. Kontrollera att filen innehåller registerformatet \`schema_version: 2\`
   enligt den privata GDPR-slutrevisionen och att den är behörighetsbegränsad.
2. Installera [GitHub CLI](https://cli.github.com/) om den saknas och kör
   \`gh auth login\` med behörighet att administrera Actions-secrets i samtliga
   fem repositories.
3. Öppna PowerShell utanför repo-/synkroniserade kataloger och kör:

   \`\`\`powershell
   & 'C:\Git\gax100-analys\scripts\install_privacy_registry_secret.ps1' -RegistryPath 'C:\privat\loppanalys-registry.json' -WhatIf
   & 'C:\Git\gax100-analys\scripts\install_privacy_registry_secret.ps1' -RegistryPath 'C:\privat\loppanalys-registry.json'
   \`\`\`

   Byt sökvägarna till de **faktiska** lokala sökvägarna. Skriptet skickar
   samma Base64-kodade JSON **via stdin** till \`gh secret set\` för
   \`ultravasan-analys\`, \`gotaleden-splits\`,
   \`osterlen-spring-trail-analys\`, \`satila-splits\` och \`gax100-analys\`.
   Det varken skriver värdet eller returnerar det i någon logg. GitHub CLI
   krypterar värdet före uppladdning.

4. Kontrollera att varje repository har secreten med namn
   \`LOPPANALYS_PRIVACY_REGISTRY_B64\`; kontrollera endast metadata, inte värdet.
5. Kör om respektive GDPR-publiceringsgrind och ordinarie livekäll-QA.
   GitHub Actions på forks/external PRs kan sakna secrets av säkerhetsskäl;
   använd en behörig intern körning på rätt branch.
6. Acceptera aldrig en **snapshot-QA** som ersättning för full export med privat
   register, genomgång av skyddade rader och release-kontroll.
7. Mergea/publisera först med behörigt godkännande. Hantera historiska
   Actions-artefakter, CDN-cache och gammal historik separat enligt revisionen.

## Integrationsordning GAX100

Draft PR #2 är GDPR-grunden. Draft PR #3 är analyspariteten, #4 UX-tilläggen.
Draft PR #5 är den **sammanfogade integrationskandidaten**, innehåller bägge
grenarnas ändringar och ersätter inte de separata gransknings-PR:erna.
Exporten stoppar utan giltigt register; den kontrollerar källans fullständighet
**före** filtrering och publicerar bara den exakt tillåtna delmängden **efter**
filtrering. Även PR #5 ska förbli Draft tills sekret- och releasevillkor uppfyllts.
