import test from 'node:test';
import assert from 'node:assert/strict';
import { feeds, articleURL, belongsToFeed, publisherFor } from '../src/sources.js';
import { collect } from '../src/collector.js';
import { normalize, eligible } from '../src/normalize.js';
const now=Date.parse('2026-10-14T12:00:00Z');
const publication='Wed, 14 Oct 2026 11:30:00 GMT';
const item=(url,title='Saudi Arabia reports drone attack')=>`<item><title>${title}</title><link>${url}</link><pubDate>${publication}</pubDate></item>`;
test('all configured feeds have exact allowlisted publisher hosts',()=>{
  assert.equal(new Set(feeds.map(f=>f.url)).size,feeds.length);
  for(const feed of feeds){
    assert.equal(new URL(feed.url).protocol,'https:');
    assert.ok(feed.publisherHosts.length);
    for(const host of feed.publisherHosts)assert.ok(publisherFor(host));
  }
});
test('regional and local feeds keep attribution and conservative status',()=>{
  for(const host of ['arabnews.com','english.aawsat.com','aawsat.com','albiladdaily.com','middleeasteye.net']){
    const report=normalize({title:'السعودية تعلن اعتراض صاروخ',url:`https://${host}/article`,publishedAt:publication},now);
    assert.ok(report);assert.equal(report.publisher,publisherFor(host));assert.equal(report.status,'Developing Report');assert.equal(eligible(report,now),true);
    assert.equal(articleURL(`https://${host}.evil.test/article`),null);
  }
});
test('an approved feed cannot impersonate a different allowlisted publisher',async()=>{
  const feed=feeds.find(f=>f.name==='Middle East Eye');
  assert.equal(belongsToFeed('https://bbc.com/news/pretend',feed),false);
  const result=await collect({now,requestFn:async url=>{
    if(url!==feed.url)throw new Error('offline');
    return `<rss><channel>${item('https://bbc.com/news/pretend')}${item('https://www.middleeasteye.net/news/report')}</channel></rss>`;
  }});
  assert.equal(result.reports.length,1);assert.equal(result.reports[0].publisher,'Middle East Eye');
  assert.equal(result.sources.find(s=>s.name===feed.name).matchingCount,1);
});
test('healthy feeds with no relevant matches report zero, not a connection failure',async()=>{
  const feed=feeds.find(f=>f.name==='Al Bilad');
  const result=await collect({now,requestFn:async url=>{
    if(url!==feed.url)throw new Error('offline');
    return `<rss><channel>${item('https://albiladdaily.com/sport','Saudi Arabia football results')}</channel></rss>`;
  }});
  const source=result.sources.find(s=>s.name===feed.name);
  assert.equal(source.ok,true);assert.equal(source.matchingCount,0);assert.equal(result.reports.length,0);
});
test('tracking parameters do not split one article into duplicate identifiers',()=>{
  assert.equal(articleURL('https://www.arabnews.com/article?traffic_source=rss&utm_source=feed'),articleURL('https://arabnews.com/article'));
});
