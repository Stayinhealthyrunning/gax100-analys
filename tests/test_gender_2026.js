const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('data/curated/gax100.sqlite');
function assert(ok, message) { if (!ok) throw new Error(message); }
const groups = db.prepare("SELECT gender, gender_source_id, COUNT(*) AS n FROM results WHERE edition_id='gax100-2026' GROUP BY gender, gender_source_id").all();
const women = groups.find((row) => row.gender === 'Kvinnor' && row.gender_source_id === 'result-2026-gender');
const men = groups.find((row) => row.gender === 'Män' && row.gender_source_id === 'result-2026-gender');
assert(women && women.n === 22, '2026 Kvinnor saknar förväntad aggregerad PDF-proveniens');
assert(men && men.n === 88, '2026 Män saknar förväntad aggregerad PDF-proveniens');
console.log(JSON.stringify({ pass: true, groups }, null, 2));
db.close();
