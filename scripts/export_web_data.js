const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { loadRules, shouldWithhold } = require('./public_privacy');
const { checkPublicPayload, checkFilteredPayload } = require('./verify_source_integrity');
const db = new DatabaseSync(path.join(__dirname, '..', 'data', 'curated', 'gax100.sqlite'));
const editions = db.prepare('SELECT edition_id, year, edition_label, starters, starters_source_id, starters_note FROM editions ORDER BY year, edition_id').all();
const results = db.prepare(`SELECT result_id, edition_id, raw_name name, raw_gender gender, raw_club club, raw_rank rank, raw_finish_time finish_raw, status, finish_seconds FROM results ORDER BY edition_id, finish_seconds IS NULL, finish_seconds, raw_name`).all();
const observations = db.prepare('SELECT result_id, checkpoint_id, checkpoint_raw_name name, checkpoint_raw_distance_km distance_km, raw_time, elapsed_seconds FROM observations ORDER BY result_id, checkpoint_raw_distance_km').all();
const byResult = new Map(); for (const o of observations) { if (!byResult.has(o.result_id)) byResult.set(o.result_id, []); byResult.get(o.result_id).push(o); }
// Check the complete independently verified SOURCE projection before any removal.
const rawPayload = { editions, results: results.map(r =>
  ({...r, observations: byResult.get(r.result_id) || []})) };
const rawViolations = checkPublicPayload(rawPayload);
if (rawViolations.length) {
  db.close();
  throw new Error('Fail closed: source completeness violated before privacy filtering: ' + rawViolations.join('; '));
}
// Publication requires an access-controlled private registry, never a public
// list of reversible person fingerprints. Remove *whole* protected results.
const privacyRules = loadRules();
// The public export itself must always require the private registry, even
// when invoked locally without the CI-only REQUIRE_PRIVATE_REGISTRY setting.
if (!privacyRules.registryLoaded) {
  db.close();
  throw new Error('Private registry missing; public export stopped');
}
const publicResults = rawPayload.results.filter(row => !shouldWithhold(row,privacyRules));
const payload = {generated_at:new Date().toISOString(), editions, results:publicResults};
const publishedViolations = checkFilteredPayload(rawPayload,payload,row => shouldWithhold(row,privacyRules));
if (publishedViolations.length) {
  db.close();
  throw new Error('Fail closed: sanitized publication deviates from complete source minus protected rows: '+
    publishedViolations.join('; '));
}
const out = path.join(__dirname, '..', 'web', 'data.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
const temporary = out + '.' + process.pid + '.tmp';
try { fs.writeFileSync(temporary, JSON.stringify(payload)); fs.renameSync(temporary, out); }
finally { if (fs.existsSync(temporary)) fs.rmSync(temporary); }
console.log(`exported editions=${editions.length} results=${publicResults.length} withheld=${results.length-publicResults.length}`);
