import test from 'node:test';
import assert from 'node:assert/strict';
import { articleURL } from '../src/sources.js';
import { normalize, eligible } from '../src/normalize.js';
import { parseFeed, collect } from '../src/collector.js';
import { send, message } from '../src/telegram.js';
import { monitor } from '../src/monitor.js';
import { Store } from '../src/store.js';
import handler from '../api/reports.js';
const now = Date.parse('2026-10-11T10:00:00Z');
const raw = { title: 'Saudi Arabia reports drone attack', url: 'https://www.bbc.com/news/articles/test', publishedAt: '2026-10-11T09:30:00Z' };
const report = () => normalize(raw,now);
class Memory {
  constructor(){this.values=new Map();}
  async get(k){return this.values.get(k) || null;}
  async set(k,v){this.values.set(k,structuredClone(v));}
  async claim(k){if(this.values.has(k))return false;this.values.set(k,true);return true;}
  unlock(){this.values.delete('run-lock');}
}
const collection = async () => ({ reports:[report()],sources:[{name:'Test source',ok:true,checkedAt:new Date(now).toISOString()}] });
test('URL validation rejects malicious protocols, credentials, ports, and lookalike hosts',()=>{
  for(const url of ['javascript:alert(1)','http://bbc.com/a','https://bbc.com.evil.test/a','https://bbc.com@evil.test/a','https://127.0.0.1/a','https://bbc.com:8000/a']) assert.equal(articleURL(url),null);
  assert.equal(articleURL('https://www.bbc.com/news/a/?utm_source=test#x'),'https://bbc.com/news/a');
});
test('English and Arabic headlines require Saudi context and current dates',()=>{
  assert.equal(report().status,'Developing Report');
  assert.ok(normalize({...raw,title:'السعودية تعلن اعتراض صاروخ'},now));
  for(const patch of [{title:'Drone attack in another country'},{title:'Saudi Arabia football results'},{publishedAt:'2020-01-01'},{publishedAt:'invalid'},{publishedAt:'2026-10-12'},{title:'Saudi Arabia drone attack anniversary'}])assert.equal(normalize({...raw,...patch},now),null);
});
test('GDELT discovery time is never treated as publication or confirmation',()=>{
  const r=normalize({...raw,publishedAt:null,discoveredAt:'2026-10-11T09:30:00Z'},now);
  assert.equal(r.publishedAt,null);assert.equal(r.status,'Unverified');assert.equal(eligible(r,now),false);
  assert.equal(eligible(report(),now),true);assert.equal(eligible(report(),now+3*3600000),false);
});
test('RSS parsing handles entity text and rejects DTD or malformed responses',()=>{
  assert.equal(parseFeed('<rss><channel><item><title>Saudi emergency &amp; warning</title><link>https://bbc.com/a</link><pubDate>Sun, 11 Oct 2026 09:00:00 GMT</pubDate></item></channel></rss>')[0].title,'Saudi emergency & warning');
  assert.throws(()=>parseFeed('<!DOCTYPE rss><rss/>'));assert.throws(()=>parseFeed('<html>bad'));
});
test('collector preserves partial success and reports source outages',async()=>{
  const result=await collect({now,requestFn:async url=>{if(url.includes('api.gdelt'))return JSON.stringify({articles:[{title:raw.title,url:raw.url,seendate:'20261011T093000Z'}]});throw new Error('offline');}});
  assert.equal(result.sources.filter(s=>s.ok).length,1);assert.equal(result.reports[0].status,'Unverified');
});
test('Telegram message escapes external text and links',()=>{
  const text=message({...report(),title:'<script>alert("x")</script> & headline'});
  assert.ok(!text.includes('<script>'));assert.ok(text.includes('&lt;script&gt;'));assert.ok(text.includes('AST (UTC+3)'));assert.ok(text.includes('https://bbc.com/'));
});
const env={TELEGRAM_BOT_TOKEN:'123:TEST',TELEGRAM_CHAT_ID:'-123'};
test('Telegram retries explicit rate limits, but never ambiguous timeouts',async()=>{
  let attempts=0,waits=0;
  const id=await send('test',{env,sleepFn:async()=>waits++,fetchFn:async()=>{attempts++;return new Response(JSON.stringify(attempts===1?{ok:false,error_code:429,parameters:{retry_after:1}}:{ok:true,result:{message_id:42}}),{status:attempts===1?429:200});}});
  assert.equal(id,42);assert.equal(attempts,2);assert.equal(waits,1);
  attempts=0;await assert.rejects(send('test',{env,fetchFn:async()=>{attempts++;throw new Error('secret URL');}}),/uncertain/);assert.equal(attempts,1);
});
test('first run baselines existing reports; later repeated articles send at most once',async()=>{
  const store=new Memory();let sends=0;
  await monitor({store,collectFn:collection,sendFn:async()=>sends++,now});assert.equal(sends,0);
  store.unlock();const newer={...report(),id:'new-id',fingerprint:'new-headline'};
  const next=async()=>({...await collection(),reports:[newer]});
  await monitor({store,collectFn:next,sendFn:async()=>sends++,now});assert.equal(sends,1);
  store.unlock();await monitor({store,collectFn:next,sendFn:async()=>sends++,now});assert.equal(sends,1);
});
test('identical syndicated headlines suppress duplicate notifications',async()=>{
  const store=new Memory();await store.set('initialized',true);let sends=0;
  await monitor({store,now,collectFn:async()=>({...await collection(),reports:[report(),{...report(),id:'other-url'}]}),sendFn:async()=>sends++});assert.equal(sends,1);
});
test('failed delivery remains claimed and reports run failure',async()=>{
  const store=new Memory();await store.set('initialized',true);let sends=0;
  await assert.rejects(monitor({store,collectFn:collection,sendFn:async()=>{sends++;throw new Error();},now}),/Telegram/);
  assert.equal((await store.get('snapshot')).notifications.errors,1);
  store.unlock();await monitor({store,collectFn:collection,sendFn:async()=>sends++,now});assert.equal(sends,1);
});
test('source outage retains cached reports and last successful update',async()=>{
  const store=new Memory();await monitor({store,collectFn:collection,now});store.unlock();
  await assert.rejects(monitor({store,now:now+1000,collectFn:async()=>({reports:[],sources:[{name:'Test source',ok:false,checkedAt:new Date(now+1000).toISOString()}]})}),/All news sources/);
  const state=await store.get('snapshot');assert.equal(state.reports.length,1);assert.equal(state.lastSuccessAt,new Date(now).toISOString());assert.equal(state.sources[0].lastSuccessAt,new Date(now).toISOString());
});
test('storage failure prevents notification delivery',async()=>{
  let sent=false;await assert.rejects(monitor({store:{claim:async()=>{throw new Error('offline');}},sendFn:async()=>sent=true,now}));assert.equal(sent,false);
});
test('storage only permits configured Upstash HTTPS endpoints',()=>{
  for(const url of ['http://foo.upstash.io','https://localhost','https://foo.upstash.io.evil.test','https://foo.upstash.io/path'])assert.throws(()=>new Store({UPSTASH_REDIS_REST_URL:url,UPSTASH_REDIS_REST_TOKEN:'test'}));
});
test('public endpoint rejects writes without accessing storage',async()=>{
  const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(v){this.code=v;return this;},json(v){this.body=v;}};
  await handler({method:'POST'},res);assert.equal(res.code,405);assert.equal(res.headers.Allow,'GET');
});
test('seven-day collection includes older reports without making them alert-eligible',async()=>{
  const older = new Date(now - 3 * 86400000).toISOString();
  const result = await collect({now,requestFn:async url=>{
    if(url.includes('api.gdelt')){
      assert.equal(new URL(url).searchParams.get('timespan'),'7d');
      return JSON.stringify({articles:[]});
    }
    return `<rss><channel><item><title>Saudi Arabia reports drone attack</title><link>https://bbc.com/news/articles/past-day-test</link><pubDate>${older}</pubDate></item></channel></rss>`;
  }});
  assert.equal(result.reports.length,1);
  assert.equal(result.reports[0].publishedAt,older);
  assert.equal(eligible(result.reports[0],now),false);
  assert.equal(normalize({...raw,publishedAt:new Date(now-8*86400000).toISOString()},now),null);
});
test('monitor keeps saved reports across runs for seven days and expires older ones',async()=>{
  const store=new Memory();
  const retained={...report(),id:'saved',publishedAt:new Date(now-6*86400000).toISOString()};
  const expired={...report(),id:'expired',publishedAt:new Date(now-8*86400000).toISOString()};
  await store.set('snapshot',{reports:[retained,expired],sources:[]});
  const result=await monitor({store,now,collectFn:async()=>({...await collection(),reports:[]})});
  assert.deepEqual(result.reports.map(r=>r.id),['saved']);
});
test('run lock is released after a run and contention is reported as a skip',async()=>{
  const store=new Memory();store.release=async k=>store.values.delete(k);
  await monitor({store,collectFn:collection,now});assert.equal(store.values.has('run-lock'),false);
  await store.claim('run-lock');await assert.rejects(monitor({store,collectFn:collection,now}),e=>e.locked===true);
});
test('sport, overseas aid and opinion items are excluded, including previously saved ones',async()=>{
  for(const patch of [{title:'Saudi Toyota Championship Time Attack to be decided in Jeddah'},{title:'Saudi Relief Flight Lands in Nepal to Aid Flood Victims'},{url:'https://www.arabnews.com/opinion/saudi-arabia-attacks-3006284'}])assert.equal(normalize({...raw,...patch},now),null);
  const store=new Memory();await store.set('snapshot',{reports:[{...report(),id:'old',title:'Saudi Toyota Championship Time Attack to be decided in Jeddah'}],sources:[]});
  const result=await monitor({store,now,collectFn:async()=>({...await collection(),reports:[]})});
  assert.deepEqual(result.reports.map(r=>r.id),[]);
});
