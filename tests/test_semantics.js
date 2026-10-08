const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/curated/gax100.sqlite');
function assert(ok, message) { if (!ok) throw new Error(message); }
const editions = db.prepare('SELECT edition_id, edition_label FROM editions ORDER BY edition_id').all();
assert(editions.some(e => e.edition_id === 'gax100-2021-a' && /20.21/i.test(e.edition_label)), '2021-A label saknas');
assert(editions.some(e => e.edition_id === 'gax100-2021-b' && /24.25/i.test(e.edition_label)), '2021-B label saknas');
for (const e of editions) {
  const rows = db.prepare('SELECT result_id,status,finish_seconds,raw_finish_time FROM results WHERE edition_id=?').all(e.edition_id);
  for (const r of rows) {
    assert(r.status === 'FINISHED' ? Number.isInteger(r.finish_seconds) : true, `${r.result_id}: FINISHED saknar sluttid`);
    const obs = db.prepare('SELECT checkpoint_raw_distance_km,elapsed_seconds FROM observations WHERE result_id=? ORDER BY checkpoint_raw_distance_km').all(r.result_id);
    for (let i=1;i<obs.length;i++) assert(obs[i].checkpoint_raw_distance_km >= obs[i-1].checkpoint_raw_distance_km, `${r.result_id}: checkpointordning`);
    for (const o of obs) assert(o.elapsed_seconds === null || o.elapsed_seconds >= 0, `${r.result_id}: negativ mellantid`);
  }
}
assert(db.prepare("SELECT COUNT(*) n FROM results WHERE status='DNS'").get().n === 0, 'DNS ska inte fabriceras');
assert(db.prepare('SELECT COUNT(*) n FROM results WHERE source_id IS NULL OR raw_json IS NULL').get().n === 0, 'proveniens saknas');
console.log(JSON.stringify({pass:true, editions:editions.length, semantic_checks:'passed'},null,2));
db.close();
