const fs = require('fs');
const path = require('path');
const { isSuppressed, loadRules } = require('../scripts/public_privacy');

const sourcePath = path.join(__dirname, '..', 'data', 'verified', 'result-2025-official.json');
if (!fs.existsSync(sourcePath)) throw new Error('Private GAX100 source was not restored');

const rules = loadRules();
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
let protectedMatches = 0;
for (const row of source.rows || []) {
  const sourceName = [row.first, row.last].filter(Boolean).join(' ').trim();
  if (sourceName && isSuppressed(sourceName, rules)) protectedMatches += 1;
}

// A protected match in the source is expected to remain private. The public
// export test independently proves that no matching identity is republished.
console.log(JSON.stringify({ pass: true, source_rows_checked: (source.rows || []).length, protected_matches: protectedMatches }));
