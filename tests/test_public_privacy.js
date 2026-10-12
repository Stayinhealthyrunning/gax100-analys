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

console.log(JSON.stringify({ pass: true, scanned: publicFiles.length, raw_archives_excluded: true, external_map: 'Leaflet SRI + optional OpenStreetMap tiles' }, null, 2));
