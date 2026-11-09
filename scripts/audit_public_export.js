"use strict";

// Administrative audit: never print source identities, identifiers or hashes.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { DatabaseSync } = require('node:sqlite');
const { loadRules, shouldWithhold } = require('./public_privacy');
const { checkFilteredPayload } = require('./verify_source_integrity');

const root = path.join(__dirname, '..');
function auditPayload(source, published, rules, assets) {
  const hidden = source.results.filter(row => shouldWithhold(row, rules));
  const violations = checkFilteredPayload(source, published, row => shouldWithhold(row, rules));
  const publicText = JSON.stringify(published);
  const assetText = assets.join('\n');
  const leaked = hidden.some(row => {
    const id = String(row.result_id || '');
    const name = String(row.name || '');
    return (id && (publicText.includes(id) || assetText.includes(id))) ||
      (name && (publicText.includes(name) || assetText.includes(name)));
  });
  const allPublished = new Set(published.results.map(row => row.result_id));
  const duplicate = allPublished.size !== published.results.length;
  return { pass: violations.length === 0 && !leaked && !duplicate,
    sourceCount: source.results.length, publishedCount: published.results.length,
    withheldCount: hidden.length, assetCount: assets.length };
}

function auditHistorical(source, rules) {
  const revisions = cp.execFileSync('git', ['rev-list', '--all', '--', 'web/data.json'],
    { cwd: root, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }).trim().split(/\s+/).filter(Boolean);
  const hiddenIds = new Set(source.results.filter(row => shouldWithhold(row, rules)).map(row => String(row.result_id)));
  let failed = 0, scanned = 0;
  for (const sha of revisions) {
    let snapshot;
    try {
      snapshot = JSON.parse(cp.execFileSync('git', ['show', `${sha}:web/data.json`],
        { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }));
    } catch (_) { failed++; continue; }
    scanned++;
    try {
      if (!Array.isArray(snapshot.results) ||
          snapshot.results.some(row => hiddenIds.has(String(row.result_id)) || shouldWithhold(row,rules))) failed++;
    } catch (_) { failed++; }
  }
  return { scanned, failed, pass: failed === 0 };
}

function main() {
  let result = {pass:false};
  let historical = {pass:false,scanned:0,failed:0};
  try {
    const rules = loadRules();
    if (!rules.registryLoaded) throw new Error('registry unavailable');
    const db = new DatabaseSync(path.join(root, 'data', 'curated', 'gax100.sqlite'), {readOnly:true});
    const rows = db.prepare('SELECT result_id, edition_id, raw_name name, raw_gender gender, raw_club club, raw_rank rank, raw_finish_time finish_raw, status, finish_seconds FROM results ORDER BY edition_id, finish_seconds IS NULL, finish_seconds, raw_name').all();
    const observations = db.prepare('SELECT result_id, checkpoint_id, checkpoint_raw_name name, checkpoint_raw_distance_km distance_km, raw_time, elapsed_seconds FROM observations ORDER BY result_id, checkpoint_raw_distance_km').all();
    const editions = db.prepare('SELECT edition_id, year, edition_label, starters, starters_source_id, starters_note FROM editions ORDER BY year, edition_id').all();
    db.close();
    const byId = new Map();
    for (const observation of observations) {
      if (!byId.has(observation.result_id)) byId.set(observation.result_id, []);
      byId.get(observation.result_id).push(observation);
    }
    const source = {editions,results:rows.map(row=>({...row,observations:byId.get(row.result_id)||[]}))};
    const published = JSON.parse(fs.readFileSync(path.join(root, 'web', 'data.json'), 'utf8'));
    const assetFiles = fs.readdirSync(path.join(root, 'web')).filter(name=>/\.(?:html|js|json)$/i.test(name) && name !== 'data.json');
    const assets = assetFiles.map(name=>fs.readFileSync(path.join(root, 'web', name), 'utf8'));
    result = auditPayload(source,published,rules,assets);
    result.assetCount = assetFiles.length;
    if (process.argv.includes('--history')) historical = auditHistorical(source,rules);
  } catch (_) {
    // Deliberately suppress detailed errors: they may contain protected data.
  }
  console.log(JSON.stringify({current:result,history:historical}));
  if (!result.pass) process.exitCode = 1;
}
if (require.main === module) main();
module.exports = {auditPayload,auditHistorical};
