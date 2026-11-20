#!/usr/bin/env node

/* Local-only GPX preview server. It binds to loopback and streams raw files
 * from the ignored data/raw/gpx directory; no GPX or derived geometry is
 * copied to the public web export.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const repo = path.resolve(__dirname, '..');
const previewRoot = path.join(repo, 'local', 'gpx-preview');
const inputDir = path.join(repo, 'data', 'raw', 'gpx');
const auditPath = path.join(repo, 'data', 'gpx-audit.json');
const port = Number(process.argv[2] || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

function send(response, status, type, body) {
  response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  response.end(body);
}

function safeFile(fileName) {
  const decoded = decodeURIComponent(fileName);
  if (!decoded.toLowerCase().endsWith('.gpx') || path.basename(decoded) !== decoded) return null;
  const target = path.resolve(inputDir, decoded);
  return target.startsWith(path.resolve(inputDir) + path.sep) ? target : null;
}

const server = http.createServer((request, response) => {
  try {
    const requestUrl = new URL(request.url, 'http://127.0.0.1');
    if (requestUrl.pathname === '/api/index') {
      return send(response, 200, mime['.json'], fs.readFileSync(auditPath));
    }
    if (requestUrl.pathname.startsWith('/gpx/')) {
      const target = safeFile(requestUrl.pathname.slice('/gpx/'.length));
      if (!target || !fs.existsSync(target)) return send(response, 404, 'text/plain; charset=utf-8', 'GPX saknas');
      return send(response, 200, 'application/gpx+xml; charset=utf-8', fs.readFileSync(target));
    }
    const relative = requestUrl.pathname === '/' ? 'index.html' : requestUrl.pathname.slice(1);
    const target = path.resolve(previewRoot, relative);
    if (!target.startsWith(path.resolve(previewRoot) + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) return send(response, 404, 'text/plain; charset=utf-8', 'Sidan saknas');
    return send(response, 200, mime[path.extname(target).toLowerCase()] || 'application/octet-stream', fs.readFileSync(target));
  } catch (error) {
    return send(response, 400, 'text/plain; charset=utf-8', error.message);
  }
});

server.listen(port, '127.0.0.1', () => {
  const actualPort = server.address().port;
  console.log('GAX100 lokal GPX-förhandsvisning: http://127.0.0.1:' + actualPort + '/');
  console.log('Rå-GPX strömmas endast lokalt från data/raw/gpx; inget skrivs till webbutdata.');
});
