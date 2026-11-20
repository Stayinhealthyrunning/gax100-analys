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
const { fingerprint, loadRules, isSuppressed, confirmedMinor, shouldWithhold } = require('../scripts/public_privacy');
const sharedRules = loadRules();
const fixtureRules = {
  ...sharedRules,
  entries: [...sharedRules.entries, {
    subject_id: 'case-test', action: 'remove_result', scopes: ['*'],
    match: {normalized_name_sha256: fingerprint('Anna Exempel')},
    require_review_for_new_matches: true,
    approved_matches: [{scope:'gax100-2024', identifiers:{result_id:'source-result-123'}}],
  }],
  displayName: 'Anonym löpare',
};
const fixture = {
  result_id: 'source-result-123', edition_id: 'gax100-2024',
  name: 'Exempel, Anna', club: 'Privat löparklubb',
  gender: 'Kvinnor', rank: '8', finish_seconds: 74000,
  observations: [{ result_id: 'source-result-123', checkpoint_id: 'checkpoint1', elapsed_seconds: 10000 }]
};
const youth = {...fixture, result_id: 'source-youth-124', name:'Ung, Exempel', age:17};
if (!confirmedMinor(youth) || !shouldWithhold(youth, sharedRules)) {
  throw new Error('A verified minor was exposed by GAX100 public-export policy');
}
if (confirmedMinor({...youth, age:18}) || confirmedMinor({...youth, age:null}) ||
    !confirmedMinor({edition_id:'gax100-2026', birth_year:2009}) ||
    confirmedMinor({edition_id:'gax100-2026', birth_year:2008})) {
  throw new Error('GAX100 age classification is not conservative at age-18 boundary');
}
if (!shouldWithhold(fixture, fixtureRules) || !isSuppressed('Exempel, Anna', fixtureRules) || isSuppressed('Other, Runner', fixtureRules)) {
  throw new Error('Name-fingerprint matching failed');
}
const publicPolicy = fs.readFileSync(path.join(repo, 'config/privacy-suppressions.json'), 'utf8');
if (/suppressed_name_sha256|[a-f0-9]{64}/i.test(publicPolicy)) {
  throw new Error('Public privacy policy exposes a subject fingerprint');
}
const saved = {
  value: process.env.LOPPANALYS_PRIVACY_REGISTRY_B64,
  path: process.env.LOPPANALYS_PRIVACY_REGISTRY_PATH,
  required: process.env.LOPPANALYS_REQUIRE_PRIVATE_REGISTRY,
};
delete process.env.LOPPANALYS_PRIVACY_REGISTRY_B64;
delete process.env.LOPPANALYS_PRIVACY_REGISTRY_PATH;
process.env.LOPPANALYS_REQUIRE_PRIVATE_REGISTRY = '1';
let failedClosed = false;
try { loadRules(); } catch (error) { failedClosed = /Private registry missing/.test(error.message); }
for (const [key, value] of Object.entries({LOPPANALYS_PRIVACY_REGISTRY_B64:saved.value,LOPPANALYS_PRIVACY_REGISTRY_PATH:saved.path,LOPPANALYS_REQUIRE_PRIVATE_REGISTRY:saved.required})) {
  if (value === undefined) delete process.env[key]; else process.env[key] = value;
}
if (!failedClosed) throw new Error('Production privacy registry did not fail closed');
if (!index.includes('<meta name="robots" content="noindex, nofollow">')) {
  throw new Error('Public GAX analysis page must be noindex');
}
const data = JSON.parse(contents.find(item => item.file === 'web/data.json').text);
for (const result of data.results) {
  if (isSuppressed(result.name, sharedRules) || confirmedMinor(result)) {
    throw new Error('Suppressed public identity present in web/data.json');
  }
  if (result.result_id.startsWith('anon-') || result.name === sharedRules.displayName) throw new Error('Pseudonymous row remains in public JSON');
}

console.log(JSON.stringify({ pass: true, scanned: publicFiles.length, raw_archives_excluded: true, external_map: 'Leaflet SRI + optional OpenStreetMap tiles' }, null, 2));
