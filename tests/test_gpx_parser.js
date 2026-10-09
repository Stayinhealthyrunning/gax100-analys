const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repo = path.resolve(__dirname, '..');
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gax100-gpx-fixture-'));
const fixture = `<?xml version="1.0"?><gpx version="1.1" creator="fixture"><trk><name>fixture</name><trkseg><trkpt lat="55.428" lon="13.824"><ele>3</ele><time>2026-10-09T00:00:00Z</time></trkpt><trkpt lat="55.429" lon="13.824"><ele>8</ele><time>2026-10-09T00:00:10Z</time></trkpt></trkseg></trk></gpx>`;
fs.writeFileSync(path.join(fixtureDir, 'fixture.gpx'), fixture);
const output = path.join(os.tmpdir(), 'gax100-gpx-fixture-report.json');
const run = spawnSync(process.execPath, [path.join(repo, 'scripts', 'analyze_gpx.js'), output], {
  encoding: 'utf8',
  env: { ...process.env, GAX_GPX_INPUT_DIR: fixtureDir }
});
assert.equal(run.status, 0, run.stderr || run.stdout);
const report = JSON.parse(fs.readFileSync(output, 'utf8'));
assert.equal(report.files.length, 1);
assert.equal(report.files[0].points, 2);
assert.ok(report.files[0].distance_km > 0.1 && report.files[0].distance_km < 0.2);
assert.equal(report.files[0].elevation.min_m, 3);
assert.equal(report.files[0].elevation.max_m, 8);
assert.equal(report.files[0].timestamps.quality, 'exporttid; ej löpartid');
assert.equal(report.files[0].timestamps.monotonic, true);
console.log('PASS: GPX-parserns fixture import, avstånd, höjd och tidsproveniens');
