const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(path.join(__dirname, '..', 'data', 'curated', 'gax100.sqlite'));
const editions = db.prepare('SELECT edition_id, year, edition_label, starters, starters_source_id, starters_note FROM editions ORDER BY year, edition_id').all();
const results = db.prepare(`SELECT result_id, edition_id, raw_name name, raw_gender gender, raw_club club, raw_rank rank, raw_finish_time finish_raw, status, finish_seconds FROM results ORDER BY edition_id, finish_seconds IS NULL, finish_seconds, raw_name`).all();
const observations = db.prepare('SELECT result_id, checkpoint_id, checkpoint_raw_name name, checkpoint_raw_distance_km distance_km, raw_time, elapsed_seconds FROM observations ORDER BY result_id, checkpoint_raw_distance_km').all();
const byResult = new Map(); for (const o of observations) { if (!byResult.has(o.result_id)) byResult.set(o.result_id, []); byResult.get(o.result_id).push(o); }
const payload = { generated_at: new Date().toISOString(), editions, results: results.map(r => ({ ...r, observations: byResult.get(r.result_id) || [] })) };
const out = path.join(__dirname, '..', 'web', 'data.json'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(payload));
console.log(`exported editions=${editions.length} results=${results.length} observations=${observations.length}`);
