const fs = require('fs');
const zlib = require('zlib');

function decodePdfText(value) {
  return value
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTextBlocks(buffer) {
  const blocks = [];
  let streamNumber = 0;
  for (let position = 0; (position = buffer.indexOf(Buffer.from('stream'), position)) >= 0;) {
    streamNumber += 1;
    let start = position + 6;
    if (buffer[start] === 13) start += 1;
    if (buffer[start] === 10) start += 1;
    const end = buffer.indexOf(Buffer.from('endstream'), start);
    if (end < 0) break;
    let stream = buffer.subarray(start, end);
    while (stream.at(-1) === 10 || stream.at(-1) === 13) stream = stream.subarray(0, -1);
    try { stream = zlib.inflateSync(stream); } catch { position = end + 9; continue; }
    const text = stream.toString('latin1');
    for (const match of text.matchAll(/BT([\s\S]*?)ET/g)) {
      const body = match[1];
      const tm = body.match(/1 0 0 1 ([\d.-]+) ([\d.-]+) Tm/);
      if (!tm) continue;
      const textParts = [...body.matchAll(/\(([^)]*)\)/g)].map((part) => decodePdfText(part[1]));
      if (textParts.length) blocks.push({ stream: streamNumber, x: Number(tm[1]), y: Number(tm[2]), text: textParts.join('') });
    }
    position = end + 9;
  }
  return blocks;
}

function normalizeName(value) {
  return value.replace(/[\u00a0]/g, ' ').replace(/\s+/g, ' ').trim().toLocaleLowerCase('sv-SE');
}

function compactName(value) {
  return normalizeName(value).replace(/\s+/g, '');
}

function findGender(map, rawName) {
  const normalized = normalizeName(rawName);
  const direct = map.get(normalized) || map.get(compactName(normalized));
  if (direct) return direct;
  const matches = [...map.entries()]
    .filter(([key]) => key.length > 5 && normalizeName(key).split(' ').filter((token) => token.length >= 3).every((token) => normalized.split(' ').includes(token)))
    .map(([, value]) => value);
  return new Set(matches).size === 1 ? matches[0] : null;
}

function extractGenderByName(pdfPath) {
  if (!fs.existsSync(pdfPath)) return new Map();
  const blocks = extractTextBlocks(fs.readFileSync(pdfPath));
  const map = new Map();
  let gender = null;
  const rows = new Map();
  for (const block of blocks) {
    const key = `${block.stream}:${Math.floor(block.y)}`;
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(block);
  }
  const previousRows = new Map();
  for (const [key, row] of rows.entries()) {
    const [stream, yText] = key.split(':');
    const y = Number(yText);
    const sorted = row.slice().sort((a, b) => a.x - b.x);
    const whole = sorted.map((block) => block.text).join(' ').replace(/\s+/g, ' ').trim();
    if (/^Kvinnor$/i.test(whole)) { gender = 'Kvinnor'; continue; }
    if (/^Män$/i.test(whole)) { gender = 'Män'; continue; }
    if (!gender) continue;
    const first = sorted.find((block) => block.x >= 150 && block.x < 204 && block.text.trim());
    const last = sorted.find((block) => block.x >= 204 && block.x < 292 && block.text.trim());
    if (/^(Förnamn|Efternamn)$/i.test(first?.text || '') || /^(Förnamn|Efternamn)$/i.test(last?.text || '')) continue;
    if (!first || !last) {
      if (!first && last) previousRows.set(stream, { y, first: null, last: last.text });
      continue;
    }
    const previous = previousRows.get(stream);
    const continuation = previous && !previous.first && previous.last && previous.y - y <= 20 ? `${previous.last} ` : '';
    const name = normalizeName(`${first.text} ${continuation}${last.text}`);
    if (name) {
      map.set(name, gender);
      map.set(compactName(name), gender);
    }
    previousRows.set(stream, { y, first: first.text, last: last.text });
  }
  return map;
}

module.exports = { extractGenderByName, normalizeName, compactName, findGender };
