import { createHash } from 'node:crypto';
import { articleURL, publisherFor } from './sources.js';
export const hash = value => createHash('sha256').update(value).digest('hex');
export const clean = value => typeof value === 'string' ? value.replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, '').trim().slice(0, 400) : '';
const location = /\b(saudi(?: arabia)?|riyadh|jeddah|dammam|jizan|jazan|najran|abha|mecca|makkah|medina|dhahran)\b|السعودية|السعودي|الرياض|جدة|الدمام|جازان|نجران|أبها|مكة|المدينة المنورة/i;
const categories = [
  ['Missile & drone', /\b(missiles?|drones?|intercept(?:ed|ion)?)\b|صاروخ|صواريخ|مسيرة|مسيّرة|اعتراض/i],
  ['Explosion & fire', /\b(explosion|blast|exploded|fire|fires)\b|انفجار|انفجارات|حريق|حرائق/i],
  ['Emergency', /\b(emergency|evacuat\w*|civil defen[cs]e|flood\w*|warning)\b|طوارئ|إخلاء|الدفاع المدني|سيول|تحذير/i],
  ['Security', /\b(attack\w*|security incident|terror\w*)\b|هجوم|هجمات|إرهاب/i]
];
// Editorial, retrospective, sport and overseas-aid items are not current incident reports.
export function excluded(title, url) {
  return /\b(anniversary|years? ago|on this day|retrospective|opinion|analysis|could|might|would|drill|exercise|time attack|relief flights?)\b|ذكرى|مناورات|تدريبات|تحليل/i.test(title)
    || /\/(opinion|op-ed|columns?|columnists?)\//i.test(new URL(url).pathname);
}
export function normalize(raw, now = Date.now()) {
  const title = clean(raw.title), url = articleURL(raw.url);
  const category = categories.find(([, pattern]) => pattern.test(title))?.[0];
  if (!url || !title || !location.test(title) || !category) return null;
  if (excluded(title, url)) return null;
  const stamp = Date.parse(raw.publishedAt || raw.discoveredAt);
  if (!Number.isFinite(stamp) || stamp > now + 5 * 60000 || now - stamp > 7 * 24 * 3600000) return null;
  const publishedAt = raw.publishedAt ? new Date(stamp).toISOString() : null;
  return { id: hash(url), title, url, publisher: publisherFor(new URL(url).hostname), publishedAt,
    discoveredAt: new Date(raw.discoveredAt || now).toISOString(), category,
    location: null, status: publishedAt ? 'Developing Report' : 'Unverified',
    statusReason: publishedAt ? 'Publisher reporting; not independently corroborated.' : 'Discovery only; publication time has not been verified.',
    fingerprint: hash(title.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '')) };
}
export function eligible(report, now = Date.now()) {
  const age = now - Date.parse(report.publishedAt);
  return report.status === 'Developing Report' && !!articleURL(report.url) && age >= 0 && age <= 2 * 3600000;
}
