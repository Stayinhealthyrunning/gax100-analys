const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
globalThis.GaxPlan = require('../web/plan.js');
const F = require('../web/field.js');
const data = JSON.parse(fs.readFileSync(path.join(__dirname,'../web/data.json'),'utf8'));
assert.equal(F.quantile([1,2,3,4,5], .5),3);
assert.equal(F.quantile([1,2,3,4], .5),2.5);
assert.equal(F.quantile([1,2,3,4,5], .25),2);
assert.equal(F.groupGender('Män'),'Män');
assert.equal(F.groupGender('KvINNoR'),'Kvinnor');
assert.equal(F.groupGender(null),null);
assert.equal(F.groupGender('Okänt'),null);
let withSegments=0, without=0, withDnf=0, withGender=0;
for(const e of data.editions) {
  const rows=data.results.filter(r=>r.edition_id===e.edition_id);
  const result=F.analyze(rows);
  if(result.complete) {
    withSegments++;
    assert(result.complete.n>=5,e.edition_id);
    for(const segment of result.complete.segments) {
      assert(segment.medianSeconds>0,e.edition_id);
      assert.equal(segment.n,result.complete.n);
      if(result.complete.n>=20) assert(segment.p10Seconds!=null&&segment.p90Seconds!=null);
      if(result.complete.n>=10) assert(segment.p25Seconds!=null&&segment.p75Seconds!=null);
    }
    assert(result.sprint.n>=5);
    assert(result.sprint.top.every(x=>x.seconds>0));
  } else without++;
  if(result.dnf.total>0) {
    withDnf++;
    assert.equal(result.dnf.withoutPassage+result.dnf.observed.reduce((s,x)=>s+x.count,0),result.dnf.total);
  }
  if(result.genders.reported>0) withGender++;
  const target=F.targetPosition(rows,86400);
  if(target) {
    const finished=rows.filter(r=>r.status==='FINISHED'&&Number.isFinite(r.finish_seconds)&&r.finish_seconds>0);
    assert.equal(target.n,finished.length);
    assert.equal(target.atOrBefore,finished.filter(x=>x.finish_seconds<=86400).length);
  }
  if(e.year>=2025) assert.equal(result.complete,null,'No official checkpoint series in 2025/2026');
}
assert(withSegments>=11);
assert(without>=2);
assert(withDnf>=7);
assert(withGender>=3);
assert.equal(F.analyze(data.results.filter(r=>r.edition_id==='gax100-2023')).complete.n,70);
assert.equal(F.analyze(data.results.filter(r=>r.edition_id==='gax100-2024')).complete.n,53);
assert.equal(F.analyze(data.results.filter(r=>r.edition_id==='gax100-2025')).dnf.total,40);
assert.throws(()=>F.analyze(data.results),/Never combine editions/);
const fixture=Array.from({length:6},(_,i)=>({
 status:'FINISHED',edition_id:'fixture',result_id:String(i),name:'Runner '+i,finish_seconds:1000+i*20,
 observations:[{checkpoint_id:'A',name:'A',elapsed_seconds:100},{checkpoint_id:'B',name:'B',elapsed_seconds:400}]
}));
const synthetic=F.analyze(fixture);
assert.equal(synthetic.complete.n,6);
assert.equal(synthetic.complete.segments.length,3);
assert.equal(synthetic.complete.segments[0].from,'Start');
assert.equal(synthetic.complete.segments[2].to,'Mål');
assert.equal(synthetic.complete.segments[0].p25Seconds,null);
assert.equal(synthetic.complete.segments[0].p10Seconds,null);
console.log('PASS: edition-scoped field analytics, n gates, official DNF last observation, target places, and real GAX data');
