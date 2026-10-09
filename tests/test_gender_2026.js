const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('data/curated/gax100.sqlite');
function assert(ok, message) { if (!ok) throw new Error(message); }
const groups = db.prepare("SELECT gender, gender_source_id, COUNT(*) AS n FROM results WHERE edition_id='gax100-2026' GROUP BY gender, gender_source_id").all();
const known = db.prepare("SELECT raw_name, gender, gender_source_id FROM results WHERE edition_id='gax100-2026' AND raw_name IN ('Gustav Jemt Gardell', 'Emma Holmstedt') ORDER BY raw_name").all();
assert(groups.some((row) => row.gender === 'Kvinnor' && row.gender_source_id === 'result-2026-gender'), '2026 Kvinnor saknar PDF-proveniens');
assert(groups.some((row) => row.gender === 'Män' && row.gender_source_id === 'result-2026-gender'), '2026 Män saknar PDF-proveniens');
assert(known.some((row) => row.raw_name === 'Emma Holmstedt' && row.gender === 'Kvinnor'), 'Emma Holmstedt ska vara Kvinnor enligt 2026-PDF');
assert(known.some((row) => row.raw_name === 'Gustav Jemt Gardell' && row.gender === 'Män'), 'Gustav Jemt Gardell ska vara Män enligt 2026-PDF');
console.log(JSON.stringify({ pass: true, groups, known }, null, 2));
db.close();
