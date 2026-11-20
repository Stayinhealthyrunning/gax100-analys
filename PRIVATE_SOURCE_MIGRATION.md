# Privat källhämtning

GAX100:s identifierande resultatkällor och verifierade 2025-transkription
lagras i det privata repot `Stayinhealthyrunning/loppanalys-private-data`.
Byggkedjan återställer exakt 17 tillåtna filer och kontrollerar byteantal och
SHA-256 innan analys. Innehåll och deltagaridentiteter skrivs inte till loggen.

Produktionskrav:

- `LOPPANALYS_SOURCE_APP_ID`
- `LOPPANALYS_SOURCE_APP_PRIVATE_KEY`

Läsappen ska vara installerad endast på det privata källrepot och ha
`Contents: read`. Saknas hemlighet, fil eller korrekt hash stoppas jobbet före
export och publicering. Den privata checkouten tas alltid bort efter steget.

Lokalt kan en behörig privat checkout verifieras med:

```text
python scripts/restore_private_sources.py --private-root ../loppanalys-private-data
```

Denna källborttagning ska förbli Draft tills privat hämtning har passerat full
CI. Produktionsimport av nya original kräver en separat skrivapp med minsta
möjliga rättigheter till det privata repot; läsappens nyckel får inte
återanvändas. Rättslig grund, återanvändningsrätt, gallring och oberoende
krypterad backup är fortsatt releaseblockerande.
