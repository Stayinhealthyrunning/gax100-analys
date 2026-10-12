/* Prevent anti-bot HTML and incomplete crawls from replacing a verified race archive.
 * This is a release gate, not a fallback that would fabricate missing results. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const REQUIRED_HTML = ['result-2014','result-2015','result-2016','result-2017','result-2018',
  'result-2019','result-2020','result-2021','result-2022','result-2023','result-2024'];
const REQUIRED_PDF = ['result-2025','result-2026-gender'];
const BOT_PATTERN = /just a moment|checking your browser|enable javascript and cookies|cloudflare ray id|challenge-platform|attention required/i;

function checkManifest(manifest, baseDir = process.cwd()) {
  const issues = [];
  const entries = new Map(manifest.map(entry => [entry.id,entry]));
  const checkFile = (id, type) => {
    const item = entries.get(id);
    if (!item || item.status !== 'downloaded' || item.kind !== type || typeof item.path !== 'string') {
      issues.push(id + ': not downloaded as a ' + type + ' source'); return;
    }
    const filepath = path.isAbsolute(item.path) ? item.path : path.resolve(baseDir,item.path);
    if (!fs.existsSync(filepath)) { issues.push(id + ': downloaded file does not exist'); return; }
    const bytes = fs.readFileSync(filepath);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    if (!item.sha256 || item.sha256.toLowerCase() !== hash) issues.push(id + ': SHA-256 mismatch');
    if (type === 'html') {
      const raw = bytes.toString('utf8');
      const signals = [/<(?:table|tr)\b/i.test(raw), /Namn|Förnamn|Name/i.test(raw),
        /Magleberg|Haväng|Sandhammaren/i.test(raw)];
      // Historical result pages with checkpoint data must have all 3 cues;
      // bot challenge/interstitial pages typically return 200 but contain none.
      if (BOT_PATTERN.test(raw) || signals.filter(Boolean).length < 2) {
        issues.push(id + ': HTML lacks source result-table structure or is a bot challenge (HTTP 200 is insufficient)');
      }
    } else if (bytes.length < 1000 || bytes.subarray(0,4).toString() !== '%PDF') {
      issues.push(id + ': PDF invalid or suspiciously small');
    }
  };
  REQUIRED_HTML.forEach(id=>checkFile(id,'html'));
  REQUIRED_PDF.forEach(id=>checkFile(id,'pdf'));
  return issues;
}

function checkPublicPayload(payload) {
  const problems=[];
  if (!payload || !Array.isArray(payload.editions) || !Array.isArray(payload.results)) return ['payload missing editions/results'];
  const editions = new Set(payload.editions.map(row=>row.edition_id));
  const ids = new Set(payload.results.map(row=>row.result_id));
  const observations = payload.results.reduce((acc,r)=>acc+(Array.isArray(r.observations)?r.observations.length:0),0);
  if (editions.size !== 14) problems.push('Expected 14 edition IDs, got '+editions.size);
  if (payload.results.length !== 945) problems.push('Expected 945 results, got '+payload.results.length);
  if (observations !== 1838) problems.push('Expected 1838 observations, got '+observations);
  if (ids.size !== payload.results.length) problems.push('duplicate result IDs');
  if (!editions.has('gax100-2021-a') || !editions.has('gax100-2021-b')) problems.push('two 2021 race editions missing');
  return problems;
}

if (require.main === module) {
  const root = path.resolve(__dirname,'..');
  const manifest = JSON.parse(fs.readFileSync(path.join(root,'data/raw/MANIFEST.json'),'utf8').replace(/^\uFEFF/,''));
  const problems = checkManifest(manifest,root);
  if (problems.length) {
    console.error('BLOCKED: live-source verification failed; do not rebuild/redeploy GAX100:');
    problems.forEach(p=>console.error('  - '+p));
    process.exitCode = 1;
  } else console.log('PASS: live sources include verified historical race-table structure and authentic PDF headers.');
}

module.exports = {checkManifest,checkPublicPayload};
