# GAX100 datamodell – ETAPP 2B förberedelse

## Identiteter

- `race_family_id`: konstant `gax100-100-miles`.
- `race_edition_id`: år och verklig upplaga, t.ex. `gax100-2021-a` och `gax100-2021-b`; får inte härledas enbart från namn.
- `course_version_id`: immutable version med källa, giltighetsperiod och jämförbarhetsbedömning.
- `result_id`: source-scoped stabilt ID; namn används aldrig som identitet.

## Resultatpost

`race_edition_id`, `result_id`, `source_id`, `raw_name`, `raw_club`, `raw_gender`, `raw_status`, `raw_finish_time`, `status_normalized`, `gender_normalized`, `finish_seconds`, `provenance`.

Alla `raw_*` bevaras. Normalisering får endast ge `FINISHED`, `DNF`, `DNS`, `DSQ` eller `UNKNOWN` när källtexten stöder det. Oklara tomma fält blir `UNKNOWN`/saknat och inte DNF/DNS.

## Tidsobservation

`race_edition_id`, `result_id`, `checkpoint_id`, `checkpoint_raw_name`, `checkpoint_raw_distance_km`, `raw_time`, `elapsed_seconds`, `source_id`, `observation_status`.

Kontrollpunkter med 43/44, 79/80 eller 130/131 km är separata källvärden tills arrangörens editionssemantik verifierats.

## Kurs

`course_version_id`, `race_edition_id[]`, `source_id`, `source_url`, `file_sha256`, `geometry_status`, `publication_rights_status`, `comparison_status`.

GPX-spår utan publiceringsrätt eller med oklar autenticitet ska stanna i privat råarkiv och inte exporteras till publik data.
