import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { feeds, belongsToFeed } from './sources.js';
import { request } from './http.js';
import { normalize } from './normalize.js';
export function parseFeed(xml) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) throw new Error('Invalid feed');
  const data = new XMLParser({ ignoreAttributes: false, processEntities: true }).parse(xml);
  if (!data.rss?.channel) throw new Error('Unsupported feed');
  const items = data.rss.channel.item || [];
  return (Array.isArray(items) ? items : [items]).map(item => ({ title: item.title, url: item.link, publishedAt: item.pubDate }));
}
export async function collect({ now = Date.now(), requestFn = request, onProgress = () => {} } = {}) {
  const jobs = feeds.map(feed => ({ ...feed, parse: text => parseFeed(text).filter(item => belongsToFeed(item.url, feed)) }));
  const outcomes = await Promise.all(jobs.map(async job => {
    try {
      const reports = job.parse(await requestFn(job.url)).map(raw => normalize(raw, now)).filter(Boolean);
      onProgress(`${job.name}: ${reports.length} matching reports`);
      return { name: job.name, ok: true, checkedAt: new Date(now).toISOString(), matchingCount: reports.length, reports };
    }
    catch { onProgress(`${job.name}: unavailable`); return { name: job.name, ok: false, checkedAt: new Date(now).toISOString(), error: 'Source unavailable or invalid response', reports: [] }; }
  }));
  const reports = new Map();
  for (const r of outcomes.flatMap(o => o.reports)) if (!reports.has(r.id) || r.publishedAt) reports.set(r.id, r);
  return { reports: [...reports.values()], sources: outcomes.map(({ reports, ...source }) => source) };
}
