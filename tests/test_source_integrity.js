const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {checkManifest,checkPublicPayload}=require('../scripts/verify_source_integrity');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'gax-source-contract-'));
try {
  const htmlIds=['result-2014','result-2015','result-2016','result-2017','result-2018',
    'result-2019','result-2020','result-2021','result-2022','result-2023','result-2024'];
  const pdfIds=['result-2025','result-2026-gender'];
  const manifest=[...htmlIds.map(id=>({id,kind:'html'})),...pdfIds.map(id=>({id,kind:'pdf'}))].map((source,i)=>{
    const raw=source.kind==='html'?
      Buffer.from('<!doctype html><h2>GAX100 resultat</h2><table><tr><th>Namn</th><th>Magleberg 44 km</th><th>Mål</th></tr><tr><td>Löpare</td><td>6:00</td><td>24:00</td></tr></table>'):
      Buffer.from('%PDF-1.7\n'+'x'.repeat(1500));
    const filename=path.join(root,String(i)+(source.kind==='pdf'?'.pdf':'.html'));
    fs.writeFileSync(filename,raw);
    return {...source,status:'downloaded',path:filename,sha256:crypto.createHash('sha256').update(raw).digest('hex')};
  });
  assert.deepEqual(checkManifest(manifest,root),[]);
  const blocked=manifest.find(x=>x.id==='result-2023');
  const challenge=Buffer.from('<html><title>Just a moment...</title><p>Checking your browser before accessing</p></html>');
  fs.writeFileSync(blocked.path,challenge);
  blocked.sha256=crypto.createHash('sha256').update(challenge).digest('hex');
  assert(checkManifest(manifest,root).some(x=>/result-2023.*bot challenge/.test(x)));
  blocked.status='failed';
  assert(checkManifest(manifest,root).some(x=>/result-2023.*not downloaded/.test(x)));
  const src=JSON.parse(fs.readFileSync(path.join(__dirname,'../web/data.json'),'utf8'));
  assert.deepEqual(checkPublicPayload(src),[]);
  assert(checkPublicPayload({...src,editions:src.editions.slice(0,1)}).some(x=>/14 edition/.test(x)));
  assert(checkPublicPayload({...src,results:src.results.slice(0,1)}).some(x=>/945 results/.test(x)));
  assert(checkPublicPayload({...src,results:[...src.results,src.results[0]]}).some(x=>/duplicate/.test(x)));
  console.log('PASS: fail-closed bot interstitial/source integrity and 14/945/1838 snapshot baseline');
} finally { fs.rmSync(root,{recursive:true,force:true}); }
