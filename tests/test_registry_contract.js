/* Private GDPR registry contract, entirely synthetic; never store real hashes here. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {fingerprint,loadRules,isSuppressed,shouldWithhold,confirmedMinor}=require('../scripts/public_privacy');
const envNames=['LOPPANALYS_PRIVACY_REGISTRY_B64','LOPPANALYS_PRIVACY_REGISTRY_PATH','LOPPANALYS_REQUIRE_PRIVATE_REGISTRY'];
const old=Object.fromEntries(envNames.map(key=>[key,process.env[key]]));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'gax-registry-fixture-'));
try {
  delete process.env.LOPPANALYS_PRIVACY_REGISTRY_B64;
  delete process.env.LOPPANALYS_PRIVACY_REGISTRY_PATH;
  process.env.LOPPANALYS_REQUIRE_PRIVATE_REGISTRY='1';
  assert.throws(()=>loadRules(),/Private registry missing; publication stopped/);
  const athlete={result_id:'fixture-id-2024',edition_id:'gax100-2024',
    name:'Exempel, Anna',club:'Fixture club',status:'FINISHED',finish_seconds:72000};
  const registry={schema_version:2,entries:[{
    subject_id:'synthetic-only',action:'remove_result',
    match:{normalized_name_sha256:fingerprint('Anna Exempel')},
    require_review_for_new_matches:true,
    approved_matches:[{scope:'gax100-2024',identifiers:{result_id:'fixture-id-2024'}}]
  }]};
  // This is a deliberate stand-in for the actual administrator-controlled secret.
  process.env.LOPPANALYS_PRIVACY_REGISTRY_B64=
    Buffer.from(JSON.stringify(registry),'utf8').toString('base64');
  const rules=loadRules();
  assert.equal(rules.registryLoaded,true);
  assert.equal(isSuppressed(athlete.name,rules),true);
  assert.equal(shouldWithhold(athlete,rules),true);
  assert.equal(shouldWithhold({...athlete,name:'Annan, Exempel'},rules),false);
  assert.equal(shouldWithhold({...athlete,name:'Barn, Exempel',age:17},rules),true);
  assert.equal(confirmedMinor({...athlete,age:18}),false);
  assert.throws(()=>shouldWithhold({...athlete,result_id:'unapproved-match'},rules),
    /Potential protected-identity match requires private manual review/);
  process.env.LOPPANALYS_PRIVACY_REGISTRY_B64='invalid-base64-json';
  assert.throws(()=>loadRules(),/Invalid private privacy registry secret/);
  process.env.LOPPANALYS_PRIVACY_REGISTRY_B64=
    Buffer.from(JSON.stringify({...registry,schema_version:1})).toString('base64');
  assert.throws(()=>loadRules(),/Unsupported private privacy registry schema/);
  process.env.LOPPANALYS_PRIVACY_REGISTRY_B64=
    Buffer.from(JSON.stringify({...registry,entries:[{...registry.entries[0],name:'Synthetic plaintext'}]})).toString('base64');
  assert.throws(()=>loadRules(),/must not contain plaintext identity fields/);
  const fixturePath=path.join(tmp,'private-registry.json');
  fs.writeFileSync(fixturePath,JSON.stringify(registry),{mode:0o600});
  delete process.env.LOPPANALYS_PRIVACY_REGISTRY_B64;
  process.env.LOPPANALYS_PRIVACY_REGISTRY_PATH=fixturePath;
  assert.equal(shouldWithhold(athlete,loadRules()),true);
  console.log('PASS: synthetic private registry, required secret, matched, age <18, review, malformed and plaintext rejection');
} finally {
  for(const [key,value] of Object.entries(old)){
    if(value===undefined) delete process.env[key]; else process.env[key]=value;
  }
  fs.rmSync(tmp,{recursive:true,force:true});
}
