const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync('web/index.html','utf8'); const js=fs.readFileSync('web/app.js','utf8'); const css=fs.readFileSync('web/styles.css','utf8'); const data=JSON.parse(fs.readFileSync('web/data.json','utf8'));
if(!html.includes('id="year"')||!html.includes('id="facts"')||!html.includes('id="comparison"')||!html.includes('id="history"')||!html.includes('id="map-duel"')) throw new Error('Standardsektioner saknas');
if(!js.includes('data-duel')||!js.includes('state.duel.length < 5')||!js.includes('result.rank')) throw new Error('Historisk jämförelse, Kartduell-kontrakt eller placeringsfält saknas');
new vm.Script(js); if(!css.includes('@media(max-width:899px)')||!css.includes('@media(max-width:380px)')) throw new Error('Responsiva brytpunkter saknas');
if(data.editions.length!==13||data.results.length!==826) throw new Error(`Fel export: editions=${data.editions.length} results=${data.results.length}`);
if(!data.editions.some(e=>e.edition_id==='gax100-2021-a')||!data.editions.some(e=>e.edition_id==='gax100-2021-b')) throw new Error('2021-editions saknas');
console.log(JSON.stringify({pass:true,dom_sections:['facts','runner','histogram','scatter','comparison','rows'],editions:data.editions.length,results:data.results.length},null,2));
