"""GAX100 source metadata is not an invented 2014-2026 mapped course."""
import json
from pathlib import Path
import re
import unittest
ROOT=Path(__file__).resolve().parents[1]

class GAXCourseEvidenceTests(unittest.TestCase):
 def setUp(self):
  self.obj=json.loads((ROOT/'config/gax100-course-evidence.json').read_text(encoding='utf-8'))
 def test_2026_official_garmin_url_is_only_a_candidate(self):
  obj=self.obj
  self.assertEqual(obj['source_url'],'https://gax100.se/bana-karta/')
  self.assertEqual(obj['organizer_gpx_link'],'https://connect.garmin.com/app/course/484861455')
  self.assertEqual(obj['source_download_status'],'GARMIN_PAGE_IDENTIFIED_NO_GPX_BYTES_ACQUIRED')
  self.assertIsNone(obj['byte_sha256'])
  for key in ('geometry_verified','elevation_verified','elevation_datum_verified',
              'public_map_allowed','replay_allowed','cross_edition_whole_course_comparison_allowed'):
   self.assertIs(obj[key],False,key)
 def test_four_historical_stages_are_named_without_coordinates(self):
  self.assertEqual([x['name'] for x in self.obj['checkpoints']],
                   ['Magleberg','Haväng','Sandhammaren','Ystad mål'])
  self.assertTrue(all(x['coordinate_verified'] is False for x in self.obj['checkpoints']))
 def test_2024_change_does_not_create_false_edition_group(self):
  self.assertEqual(self.obj['historical_2024_change']['change_year'],2024)
  self.assertFalse(self.obj['historical_2024_change']['allow_course_version_inference'])
  editions=self.obj['editions']
  self.assertEqual(len(editions),14)
  self.assertEqual(len({x['edition_key'] for x in editions}),14)
  self.assertIn('2021-a-gax100',{x['edition_key'] for x in editions})
  self.assertIn('2021-b-gax100',{x['edition_key'] for x in editions})
  for row in editions:
   self.assertIsNone(row['gpx_sha256'])
   self.assertIsNone(row['course_version_id'])
   self.assertIsNone(row['whole_course_comparison_group'])
   self.assertFalse(row['route_geometry_verified'])
   self.assertFalse(row['public_map_allowed'])
   self.assertFalse(row['replay_allowed'])
   self.assertFalse(row['elevation_analytic_approved'])
 def test_public_preview_does_not_use_unapproved_gps(self):
  data=ROOT/'docs/data/route-inventory.json'
  self.assertEqual(json.loads(data.read_text(encoding='utf-8')),[])
  for p in (ROOT/'docs/data/races').glob('*.json'):
   race=json.loads(p.read_text(encoding='utf-8'))
   self.assertFalse(race['distance_verified'])
   self.assertEqual(race['route_status'],'none')
   self.assertIsNone(race['course_version'])
if __name__=='__main__':unittest.main()
