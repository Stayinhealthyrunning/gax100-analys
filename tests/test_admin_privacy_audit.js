'use strict';
const assert = require('node:assert/strict');
const {fingerprint} = require('../scripts/public_privacy');
const {auditPayload} = require('../scripts/audit_public_export');

const protectedFinished={result_id:'synthetic-f',edition_id:'gax100-2024',name:'Fixture, Protected F',status:'FINISHED',finish_seconds:100,observations:[{result_id:'synthetic-f',checkpoint_id:'C1'}]};
const protectedDnf={result_id:'synthetic-d',edition_id:'gax100-2024',name:'Fixture, Protected D',status:'DNF',finish_seconds:null,observations:[{result_id:'synthetic-d',checkpoint_id:'C1'}]};
const visible={result_id:'synthetic-v',edition_id:'gax100-2024',name:'Fixture, Visible',status:'FINISHED',finish_seconds:200,observations:[]};
const source={editions:[{edition_id:'gax100-2024',starters:3}],results:[protectedFinished,protectedDnf,visible]};
const publicPayload={editions:source.editions,results:[visible]};
const rules={registryLoaded:true,entries:[protectedFinished,protectedDnf].map(row=>({
  action:'remove_result',scopes:['gax100-2024'],match:{normalized_name_sha256:fingerprint(row.name)}
}))};
assert.equal(auditPayload(source,publicPayload,rules,['const safe = true;']).pass,true);
assert.equal(auditPayload(source,{...publicPayload,results:[visible,protectedDnf]},rules,[]).pass,false);
assert.equal(auditPayload(source,publicPayload,rules,['/analysis?result=synthetic-f']).pass,false);
assert.equal(auditPayload(source,publicPayload,rules,['Fixture, Protected D']).pass,false);
assert.equal(auditPayload(source,{...publicPayload,results:[{...visible,observations:[{checkpoint_id:'invented'}]}]},rules,[]).pass,false);
console.log('PASS administrative privacy-audit synthetic contract');
