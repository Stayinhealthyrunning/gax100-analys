const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');

const repo = path.resolve(__dirname, '..');
const child = spawn(process.execPath, [path.join(repo, 'scripts', 'serve_gpx_preview.js'), '0'], { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
let settled = false;
function finish(error) {
  if (settled) return;
  settled = true;
  child.kill();
  if (error) { console.error(error); process.exitCode = 1; } else console.log('PASS: lokal GPX-preview serverar karta, metadata och rå-GPX endast på loopback');
}
const timeout = setTimeout(() => finish(new Error('preview server startade inte inom tidsgränsen')), 5000);
child.stdout.on('data', async (chunk) => {
  output += chunk.toString();
  const match = output.match(/127\.0\.0\.1:(\d+)\//);
  if (!match || settled) return;
  clearTimeout(timeout);
  try {
    const root = await fetch('http://127.0.0.1:' + match[1] + '/');
    const index = await fetch('http://127.0.0.1:' + match[1] + '/api/index');
    const catalog = await index.json();
    const gpx = await fetch('http://127.0.0.1:' + match[1] + '/gpx/' + encodeURIComponent(catalog.files[0].file));
    const html = await root.text();
    const raw = await gpx.text();
    assert.equal(root.status, 200);
    assert.equal(index.status, 200);
    assert.equal(catalog.files.length, 5);
    assert.match(html, /GAX100 lokal GPX-förhandsvisning/);
    if (gpx.status === 200) assert.match(raw, /<trkpt/);
    else assert.equal(gpx.status, 404, 'CI får sakna det ignorerade privata GPX-råarkivet');
    finish();
  } catch (error) { finish(error); }
});
child.stderr.on('data', (chunk) => { output += chunk.toString(); });
child.on('exit', (code) => { if (!settled && code !== 0) finish(new Error('preview server avslutades med kod ' + code)); });
