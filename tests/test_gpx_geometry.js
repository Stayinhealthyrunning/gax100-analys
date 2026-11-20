const assert = require('node:assert/strict');
const { parseGpx, compareRoutes, project, distancePointToSegment } = require('../scripts/gpx_geometry');

const fixture = `<?xml version="1.0"?><gpx><trk><trkseg>
<trkpt lat="55.0000" lon="13.0000"><ele>1</ele></trkpt>
<trkpt lat="55.0000" lon="13.0010"><ele>2</ele></trkpt>
</trkseg><trkseg>
<trkpt lat="55.0000" lon="13.0100"><ele>3</ele></trkpt>
<trkpt lat="55.0000" lon="13.0110"><ele>4</ele></trkpt>
</trkseg></trk></gpx>`;
const route = parseGpx(fixture, { maxGapM: 250 });
assert.equal(route.rawSegments.length, 2, 'separata trkseg ska bevaras');
assert.equal(route.runs.length, 2, 'separata segment ska inte kopplas ihop');
assert.equal(route.interruptions.length, 0, 'trkseg-gräns ska inte skapa falskt hopp');

const origin = { lat: 55, lon: 13 };
const first = project({ lat: 55, lon: 13 }, origin);
const second = project({ lat: 55, lon: 13.001 }, origin);
const offset = project({ lat: 55.0001, lon: 13.0005 }, origin);
assert.ok(Math.abs(distancePointToSegment(offset, first, second) - 11.119) < 0.5, 'punkt-till-segment ska mäta tväravstånd i meter');

const broken = parseGpx(`<gpx><trk><trkseg>
<trkpt lat="55.0000" lon="13.0000"/><trkpt lat="55.0000" lon="13.0010"/>
<trkpt lat="55.0100" lon="13.0010"/><trkpt lat="55.0100" lon="13.0020"/>
</trkseg></trk></gpx>`, { maxGapM: 250 });
assert.equal(broken.runs.length, 2, 'saknat avsnitt ska delas vid onormalt hopp');
assert.equal(broken.interruptions.length, 1, 'onormalt hopp ska rapporteras');

const parallel = parseGpx(`<gpx><trk><trkseg>
<trkpt lat="55.0000" lon="13.0000"/><trkpt lat="55.0000" lon="13.0010"/>
</trkseg></trk></gpx>`, { maxGapM: 250 });
const shifted = parseGpx(`<gpx><trk><trkseg>
<trkpt lat="55.0001" lon="13.0000"/><trkpt lat="55.0001" lon="13.0010"/>
</trkseg></trk></gpx>`, { maxGapM: 250 });
const comparison = compareRoutes(parallel, shifted, { origin, radiusM: 5000, spacingM: 10 });
assert.ok(comparison.line.symmetric.max_m < 12, 'parallella banlinjer ska jämföras mot segment');
assert.ok(comparison.line.symmetric.max_m > 5, 'avvikelsen ska inte försvinna vid resampling');
assert.ok(comparison.legacy_nearest_point.symmetric.max_m < 12);
console.log('PASS: projicerad punkt-till-linje-jämförelse, resampling och GPX-avbrott');
