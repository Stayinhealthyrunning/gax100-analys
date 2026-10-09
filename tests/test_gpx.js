const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repo = path.resolve(__dirname, '..');
const out = path.join(os.tmpdir(), 'gax100-gpx-audit-test.json');
const run = spawnSync(process.execPath, [path.join(repo, 'scripts', 'analyze_gpx.js'), out], { encoding: 'utf8' });
assert.equal(run.status, 0, run.stderr || run.stdout);
assert.match(run.stdout, /PASS: 5 GPX-filer analyserade/);
const report = JSON.parse(fs.readFileSync(out, 'utf8'));
assert.equal(report.files.length, 5);
for (const item of report.files) {
  assert.match(item.sha256, /^[a-f0-9]{64}$/);
  assert.ok(item.points > 0);
  assert.ok(item.distance_km > 150);
  assert.ok(item.bounds);
  assert.ok(item.elevation.points > 0);
}
const plotaroute = report.files.find((item) => item.file === 'Gax 100 Miles-2022-M6.gpx');
assert.equal(plotaroute.creator, 'www.plotaroute.com');
assert.equal(plotaroute.timestamps.quality, 'exporttid; ej löpartid');
assert.equal(plotaroute.timestamps.monotonic, true);
const alltrails = report.files.find((item) => item.file === 'The_Gax_100_miles.gpx');
assert.equal(alltrails.creator, 'AllTrails.com');
const trace2018 = report.files.find((item) => item.file === 'the-gax-100-miles-2018.gpx');
assert.equal(trace2018.timestamps.quality, 'exporttid; ej löpartid');
console.log('PASS: GPX-format, hash, distans, höjd och tidsproveniens verifierad');
