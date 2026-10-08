const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/curated/gax100.sqlite');
function assert(ok, message) { if (!ok) throw new Error(message); }
const editions = db.prepare('SELECT r.edition_id, e.year, COUNT(*) n FROM results r JOIN editions e USING (edition_id) GROUP BY r.edition_id, e.year').all();
const total = db.prepare('SELECT COUNT(*) n FROM results').get().n;
const observations = db.prepare('SELECT COUNT(*) n FROM observations').get().n;
assert(editions.length === 13, `Förväntade 13 importerade editions, fick ${editions.length}`);
assert(total === 826, `Förväntade 826 resultatposter, fick ${total}`);
assert(observations === 1838, `Förväntade 1838 observationer, fick ${observations}`);
assert(db.prepare("SELECT COUNT(*) n FROM results WHERE edition_id='gax100-2021-a'").get().n === 38, '2021-A ska ha 38 poster');
assert(db.prepare("SELECT COUNT(*) n FROM results WHERE edition_id='gax100-2021-b'").get().n === 42, '2021-B ska ha 42 poster');
assert(db.prepare('SELECT COUNT(*) n, COUNT(DISTINCT result_id) d FROM results').get().n === db.prepare('SELECT COUNT(*) n, COUNT(DISTINCT result_id) d FROM results').get().d, 'Resultat-ID:n är inte unika');
assert(db.prepare("SELECT COUNT(*) n FROM results WHERE status NOT IN ('FINISHED','DNF','DNS','DSQ','UNKNOWN')").get().n === 0, 'Okänd statuskod');
assert(db.prepare('SELECT COUNT(*) n FROM observations WHERE elapsed_seconds IS NOT NULL AND elapsed_seconds < 0').get().n === 0, 'Negativ observationstid');
assert(db.prepare('SELECT COUNT(*) n FROM results WHERE source_id IS NULL OR raw_json IS NULL').get().n === 0, 'Resultat saknar proveniens/råvärde');
console.log(JSON.stringify({ pass: true, editions: editions.length, results: total, observations, statuses: db.prepare('SELECT status, COUNT(*) n FROM results GROUP BY status').all() }, null, 2));
db.close();
