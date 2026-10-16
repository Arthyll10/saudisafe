import test from 'node:test';
import assert from 'node:assert/strict';
import { recentReports, filterReports, healthState, sourceState } from '../src/dashboard.js';
const now = Date.parse('2026-10-14T12:00:00Z');
const r = (id, hours, extras = {}) => ({id, title:'Saudi emergency', publisher:'BBC', publishedAt:new Date(now-hours*3600000).toISOString(), category:'Emergency', status:'Developing Report', ...extras});
test('saved history includes seven days but excludes expired and invalid records', () => {
  assert.deepEqual(recentReports([r('recent',1),r('old',150),r('expired',169),r('bad',0,{publishedAt:'bad'})],now).map(r=>r.id),['recent','old']);
});
test('search, category, status and time filters combine and sort correctly', () => {
  const reports = [r('a',1),r('b',4),r('c',30),r('d',2,{publisher:'Other',category:'Security'})];
  assert.deepEqual(filterReports(reports,{query:' BBC ',hours:6,category:'Emergency',status:'Developing Report',sort:'oldest'},now).map(r=>r.id),['b','a']);
  assert.equal(filterReports(reports,{query:'no match'},now).length,0);
  assert.equal(filterReports(reports,{},now).length,4);
});
test('discovery-only reports filter by discovery and do not gain a publication time', () => {
  const report=r('a',0,{publishedAt:null,discoveredAt:new Date(now-72*3600000).toISOString(),status:'Unverified'});
  assert.equal(filterReports([report],{hours:168},now).length,1);
  assert.equal(filterReports([report],{hours:24},now).length,0);
  assert.equal(report.publishedAt,null);
});
test('source health expires old successes and distinguishes failures and unchecked feeds',()=>{
  assert.equal(sourceState({ok:true,checkedAt:new Date(now-3600000).toISOString()},now).label,'Check overdue');
  assert.equal(sourceState({ok:true,checkedAt:new Date(now).toISOString()},now).label,'Responding');
  assert.equal(sourceState({ok:false,checkedAt:new Date(now).toISOString()},now).label,'Unavailable');
  assert.equal(sourceState({},now).label,'Not checked');
});
test('overall status separates no data, request failure, stale data and partial coverage',()=>{
  const data={lastSuccessAt:new Date(now).toISOString(),sources:[{ok:true}]};
  assert.equal(healthState(null,false,now).label,'Awaiting first update');
  assert.equal(healthState(data,true,now).label,'Connection issue');
  assert.equal(healthState(data,false,now).label,'Collection up to date');
  assert.equal(healthState({...data,sources:[{ok:false}]},false,now).label,'Partial coverage');
  assert.equal(healthState(data,false,now+3600000).label,'Updates delayed');
});
