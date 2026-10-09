#!/usr/bin/env node

/* Compare private GPX candidates without bridging GPX interruptions. */
const fs = require('node:fs');
const path = require('node:path');
const { parseGpx, compareRoutes } = require('./gpx_geometry');

const repo = path.resolve(__dirname, '..');
const inputDir = path.resolve(process.env.GAX_GPX_INPUT_DIR || path.join(repo, 'data', 'raw', 'gpx'));
const radiusM = Number(process.argv[2] || 5000);
const spacingM = Number(process.argv[3] || 25);
const origin = { lat: 55.64097, lon: 14.27477 };
const files = fs.readdirSync(inputDir).filter((file) => file.toLowerCase().endsWith('.gpx')).sort();
const routes = files.map((file) => ({ file, route: parseGpx(fs.readFileSync(path.join(inputDir, file), 'utf8'), { maxGapM: 250 }) }));

console.log(`Reference: ${origin.lat},${origin.lon}; radius=${radiusM}m; spacing=${spacingM}m; gap threshold=250m`);
for (let i = 0; i < routes.length; i += 1) {
  for (let j = i + 1; j < routes.length; j += 1) {
    const first = routes[i];
    const second = routes[j];
    const result = compareRoutes(first.route, second.route, { origin, radiusM, spacingM });
    const line = result.line.symmetric;
    const legacy = result.legacy_nearest_point.symmetric;
    console.log(`${first.file} <> ${second.file}`);
    console.log(`  line median=${line ? line.median_m.toFixed(1) : 'n/a'}m p95=${line ? line.p95_m.toFixed(1) : 'n/a'}m max=${line ? line.max_m.toFixed(1) : 'n/a'}m; >25m=${line ? (line.share_over['25'] * 100).toFixed(1) : 'n/a'}%; >50m=${line ? (line.share_over['50'] * 100).toFixed(1) : 'n/a'}%`);
    console.log(`  legacy nearest-point max=${legacy ? legacy.max_m.toFixed(1) : 'n/a'}m; sampled=${result.sampled.a}/${result.sampled.b}; interruptions=${result.interruptions.a.length}/${result.interruptions.b.length}`);
  }
}
