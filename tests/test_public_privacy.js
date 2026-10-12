const fs = require('fs');
const path = require('path');

const repo = path.join(__dirname, '..');
const publicFiles = ['web/index.html', 'web/app.js', 'web/statistics.js', 'web/time.js', 'web/data.json', 'web/karta.html'];
const contents = publicFiles.map((file) => ({ file, text: fs.readFileSync(path.join(repo, file), 'utf8') }));

for (const { file, text } of contents) {
  if (/data[\\/]raw|raw_json|gax100\.sqlite/i.test(text)) throw new Error(`${file}: råarkiv eller SQLite får inte exponeras publikt`);
  if (/\beval\s*\(|new\s+Function\s*\(/i.test(text)) throw new Error(`${file}: dynamisk kodkörning är inte tillåten`);
}

const app = contents.find((item) => item.file === 'web/app.js').text;
if (/api[_-]?key\s*[:=]|client[_-]?secret\s*[:=]|access[_-]?token\s*[:=]/i.test(app)) throw new Error('web/app.js innehåller möjlig hemlighet');
const index = contents.find((item) => item.file === 'web/index.html').text;
if (!index.includes('statistics.js') || !index.includes('time.js') || !index.includes('app.js')) throw new Error('publik HTML saknar lokala skript');
if (!/integrity="sha256-[^"]+"/.test(contents.find((item) => item.file === 'web/karta.html').text)) throw new Error('extern Leaflet-resurs saknar SRI-integritet');
if (!/noindex/i.test(contents.find((item) => item.file === 'web/karta.html').text)) throw new Error('lokal GPX-preview ska vara noindex');



// Independent fixture protects the public export against future identity leaks.
const { fingerprint, loadRules, isSuppressed, sanitizePublicRecord } = require('../scripts/public_privacy');
const sharedRules = loadRules();
const fixtureRules = {
  ...sharedRules,
  fingerprints: new Set([fingerprint('Anna Exempel')]),
  displayName: 'Anonym löpare',
};
const fixture = {
  result_id: 'source-result-123', edition_id: 'gax100-2024',
  name: 'Exempel, Anna', club: 'Privat löparklubb',
  gender: 'Kvinnor', rank: '8', finish_seconds: 74000,
  observations: [{ result_id: 'source-result-123', checkpoint_id: 'checkpoint1', elapsed_seconds: 10000 }]
};
const masked = sanitizePublicRecord(fixture, fixtureRules);
if (masked.name !== 'Anonym löpare' || masked.club !== null || !masked.result_id.startsWith('anon-')) {
  throw new Error('Suppressed athlete exposes identifying fields');
}
if (masked.result_id.includes('source-result') || masked.observations[0].result_id !== masked.result_id) {
  throw new Error('Suppressed original result ID leaks through public data');
}
if (masked.finish_seconds !== fixture.finish_seconds || masked.observations[0].elapsed_seconds !== 10000) {
  throw new Error('Privacy protection corrupted the performance observations');
}
if (!isSuppressed('Exempel, Anna', fixtureRules) || isSuppressed('Other, Runner', fixtureRules)) {
  throw new Error('Name-fingerprint matching failed');
}
if (!/<meta\\s+name="robots"\\s+content="noindex, nofollow"/i.test(index)) {
  throw new Error('Public GAX analysis page must be noindex');
}
const data = JSON.parse(contents.find(item => item.file === 'web/data.json').text);
for (const result of data.results) {
  if (isSuppressed(result.name, sharedRules)) {
    throw new Error('Suppressed public identity present in web/data.json');
  }
  if (result.result_id.startsWith('anon-') &&
      (result.name !== sharedRules.displayName || result.club !== null ||
       result.observations.some(o => o.result_id !== result.result_id))) {
    throw new Error('Incomplete identity suppression in public JSON');
  }
}

console.log(JSON.stringify({ pass: true, scanned: publicFiles.length, raw_archives_excluded: true, external_map: 'Leaflet SRI + optional OpenStreetMap tiles' }, null, 2));
