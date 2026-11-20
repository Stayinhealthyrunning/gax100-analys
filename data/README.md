# Datahantering

`data/raw/` skapas lokalt av `scripts/fetch_sources.ps1` och är git-ignorerad. Där finns endast råkopior för reproducerbar import, med URL och SHA-256 i `MANIFEST.json`. Publika commits får endast innehålla schema, auditresultat och normaliserade data som har genomgått rättighets- och integritetskontroll.

`data/source-audit.json` är en teknisk källinventering. Regexräkningarna är inte normaliserade resultatantal och får inte användas som analysdata.
