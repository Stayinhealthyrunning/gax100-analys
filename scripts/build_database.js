const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');
const { parseClockSeconds } = require('./time');

const repo = path.resolve(__dirname, '..');
const rawDir = path.join(repo, 'data', 'raw');
const dbDir = path.join(repo, 'data', 'curated');
fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'gax100.sqlite');
const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS sources (source_id TEXT PRIMARY KEY, url TEXT NOT NULL, raw_path TEXT, sha256 TEXT, fetched_at TEXT, status TEXT, error TEXT);
CREATE TABLE IF NOT EXISTS editions (edition_id TEXT PRIMARY KEY, year INTEGER NOT NULL, edition_label TEXT NOT NULL, source_id TEXT NOT NULL REFERENCES sources(source_id));
CREATE TABLE IF NOT EXISTS results (result_id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES editions(edition_id), source_id TEXT NOT NULL REFERENCES sources(source_id), source_row INTEGER NOT NULL, raw_json TEXT NOT NULL, raw_name TEXT, raw_gender TEXT, raw_club TEXT, raw_rank TEXT, raw_finish_time TEXT, status TEXT NOT NULL, gender TEXT, finish_seconds INTEGER, UNIQUE(edition_id, source_id, source_row));
CREATE TABLE IF NOT EXISTS observations (observation_id TEXT PRIMARY KEY, result_id TEXT NOT NULL REFERENCES results(result_id), checkpoint_id TEXT NOT NULL, checkpoint_raw_name TEXT NOT NULL, checkpoint_raw_distance_km REAL, raw_time TEXT NOT NULL, elapsed_seconds INTEGER, source_id TEXT NOT NULL REFERENCES sources(source_id), UNIQUE(result_id, checkpoint_id));
CREATE INDEX IF NOT EXISTS ix_results_edition ON results(edition_id);
CREATE INDEX IF NOT EXISTS ix_observations_result ON observations(result_id);`);

function clean(s) { return s.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&#8211;|&ndash;/gi, '–').replace(/&#8217;|&rsquo;/gi, '’').replace(/\s+/g, ' ').trim(); }
function cells(row) { return [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => clean(m[1])); }
function distance(header) { const m = header.match(/(\d+(?:[.,]\d+)?)\s*km/i); return m ? Number(m[1].replace(',', '.')) : null; }
function slug(v) { return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function sourceId(file) { return file.replace(/\.html$/, ''); }
function editionFor(year, heading) {
  if (year !== 2021) return { id: `gax100-${year}`, label: String(year) };
  if (/24-25 Juli/i.test(heading)) return { id: 'gax100-2021-b', label: '2021, 24–25 juli Lördag–Söndag' };
  return { id: 'gax100-2021-a', label: '2021, 20–21 juli Tisdag–Onsdag' };
}

const manifest = JSON.parse(fs.readFileSync(path.join(rawDir, 'MANIFEST.json'), 'utf8').replace(/^\uFEFF/, ''));
const insertSource = db.prepare('INSERT OR REPLACE INTO sources VALUES (?, ?, ?, ?, ?, ?, ?)');
const insertEdition = db.prepare('INSERT OR IGNORE INTO editions VALUES (?, ?, ?, ?)');
const insertResult = db.prepare('INSERT OR REPLACE INTO results VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
const insertObs = db.prepare('INSERT OR REPLACE INTO observations VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
const stats = [];

for (const src of manifest.filter(x => x.kind === 'html' && x.status === 'downloaded')) {
  const source = sourceId(path.basename(src.path));
  insertSource.run(source, src.url, src.path, src.sha256, src.fetched_at, src.status, src.error);
  const html = fs.readFileSync(src.path, 'utf8');
  const yearMatch = source.match(/(20\d\d)/); const year = yearMatch ? Number(yearMatch[1]) : 2026;
  let heading = ''; let gender = null; let rowNo = 0; let imported = 0; let observations = 0;
  const tokens = [...html.matchAll(/<(h2|h3|tr)\b[^>]*>[\s\S]*?<\/\1>/gi)];
  for (const token of tokens) {
    const tag = token[1].toLowerCase(); const raw = token[0];
    if (tag === 'h2') heading = clean(raw);
    if (tag === 'h3' && /^(Damer|Herrar|Kvinnor|Män)/i.test(clean(raw))) gender = clean(raw).replace(/\s+/g, ' ');
    if (tag !== 'tr') continue;
    const c = cells(raw); if (c.length < 2) continue;
    const header = c.join(' | ');
    if (!/(Namn|Name)/i.test(header) || !/(Tid|Time|Finish|Mål|Sluttid)/i.test(header)) continue;
    const colNames = c.map(x => x.toLowerCase());
    rowNo++;
    const edition = editionFor(year, heading); insertEdition.run(edition.id, year, edition.label, source);
    const nameIndex = colNames.findIndex(x => /^(namn|name)$/.test(x));
    const rankIndex = colNames.findIndex(x => /plats|position|placering/.test(x));
    const clubIndex = colNames.findIndex(x => /club|klubb|town|ort/.test(x));
    const finishIndex = colNames.findIndex(x => /mål|finish|sluttid/.test(x));
    const checkpointCols = c.map((x, i) => ({ name: x, index: i, distance: distance(x) })).filter(x => x.distance !== null || /magleberg|haväng|sandhammaren/i.test(x.name));
    const row = tokens.find((x, i) => i > 0 && false); // keeps parsing intentionally row-token based below
  }
  // Parse each table row with a small state machine, retaining the original HTML row.
  let currentHeading = ''; let currentGender = null; let headers = null; let sourceRow = 0;
  for (const match of html.matchAll(/<(h2|h3|tr)\b[^>]*>[\s\S]*?<\/\1>/gi)) {
    const tag = match[1].toLowerCase(); const raw = match[0];
    if (tag === 'h2') { currentHeading = clean(raw); headers = null; }
    if (tag === 'h3' && /^(Damer|Herrar|Kvinnor|Män)/i.test(clean(raw))) currentGender = clean(raw);
    if (tag !== 'tr') continue;
    const c = cells(raw); if (c.length < 2) continue;
    if (c.length === 1 && /^(Kvinnor|Män|Damer|Herrar)$/i.test(c[0])) { currentGender = c[0]; headers = null; continue; }
    if (/(Namn|Name)/i.test(c.join(' | ')) && /(Tid|Time|Finish|Mål|Sluttid)/i.test(c.join(' | '))) { headers = c; continue; }
    if (/Förnamn/i.test(c.join(' | ')) && /Efternamn/i.test(c.join(' | ')) && /Sluttid/i.test(c.join(' | '))) { headers = c; continue; }
    if (!headers) continue;
    const rankText = c[0] || ''; const nameIndex = headers.findIndex(x => /^(Namn|Name)$/i.test(x));
    const firstIndex = headers.findIndex(x => /^Förnamn$/i.test(x)); const lastIndex = headers.findIndex(x => /^Efternamn$/i.test(x));
    if (nameIndex < 0 && firstIndex < 0) continue;
    if (nameIndex >= 0 && (!c[nameIndex] || /^(Namn|Name)$/i.test(c[nameIndex]))) continue;
    if (firstIndex >= 0 && (!c[firstIndex] || !c[lastIndex])) continue;
    sourceRow++;
    const edition = editionFor(year, currentHeading); insertEdition.run(edition.id, year, edition.label, source);
    const lower = c.map(x => x.toLowerCase()); const statusText = c.find(x => /^(dnf|dns|dsq)$/i.test(x)) || '';
    const finishIndex = headers.findIndex(x => /mål|finish|sluttid/i.test(x));
    const finishRaw = finishIndex >= 0 ? (c[finishIndex] || '') : '';
    const status = statusText.toUpperCase() || (/^DNF\b/i.test(finishRaw) ? 'DNF' : parseClockSeconds(finishRaw) !== null ? 'FINISHED' : 'UNKNOWN');
    const clubIndex = headers.findIndex(x => /club|klubb|town|ort/i.test(x));
    const rankIndex = headers.findIndex(x => /plats|position|placering/i.test(x));
    const rawName = nameIndex >= 0 ? c[nameIndex] : `${c[firstIndex]} ${c[lastIndex]}`; const rawRank = rankIndex >= 0 ? c[rankIndex] : '';
    const resultId = crypto.createHash('sha256').update(`${edition.id}|${source}|${sourceRow}|${rawName}|${rawRank}`).digest('hex').slice(0, 24);
    const finishSeconds = parseClockSeconds(finishRaw); const rawJson = JSON.stringify({ html: raw, cells: c, headers });
    insertResult.run(resultId, edition.id, source, sourceRow, rawJson, rawName, currentGender, clubIndex >= 0 ? c[clubIndex] : null, rawRank, finishRaw || null, status, currentGender, finishSeconds);
    imported++;
    headers.forEach((h, i) => {
      const cp = distance(h) !== null || /magleberg|haväng|sandhammaren/i.test(h);
      if (!cp || i >= c.length || !c[i] || /mål|finish|sluttid/i.test(h)) return;
      const checkpointId = slug(h.replace(/\s*\d+(?:[.,]\d+)?\s*km/i, ''));
      const obsId = crypto.createHash('sha256').update(`${resultId}|${checkpointId}`).digest('hex').slice(0, 24);
      insertObs.run(obsId, resultId, checkpointId, h, distance(h), c[i], parseClockSeconds(c[i]), source); observations++;
    });
  }
  stats.push({ source, year, imported, observations });
}
fs.writeFileSync(path.join(dbDir, 'import-report.json'), JSON.stringify({ generated_at: new Date().toISOString(), stats }, null, 2));
console.log(JSON.stringify(stats, null, 2));
console.log(`results=${db.prepare('SELECT COUNT(*) n FROM results').get().n} observations=${db.prepare('SELECT COUNT(*) n FROM observations').get().n}`);
db.close();
