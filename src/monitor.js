import { collect } from './collector.js';
import { eligible } from './normalize.js';
import { message, send } from './telegram.js';
export async function monitor({ store, collectFn = collect, sendFn = send, now = Date.now(), onProgress = () => {} }) {
  if (!await store.claim('run-lock', 600)) throw new Error('Another run is active; try again after ten minutes');
  const startedAt = Date.now();
  const previous = await store.get('snapshot');
  onProgress('Collecting news from the past seven days. Slow sources may take around a minute…');
  const result = await collectFn({ now, onProgress });
  const good = result.sources.some(s => s.ok);
  const byId = new Map((previous?.reports || []).map(r => [r.id, r]));
  for (const r of result.reports) if (!byId.has(r.id) || r.publishedAt) byId.set(r.id, r);
  const reports = [...byId.values()].filter(r => now - Date.parse(r.publishedAt || r.discoveredAt) <= 7 * 86400000).sort((a,b) => Date.parse(b.publishedAt || b.discoveredAt) - Date.parse(a.publishedAt || a.discoveredAt)).slice(0, 500);
  const snapshot = { reports, sources: result.sources.map(s => ({ ...s, lastSuccessAt: s.ok ? s.checkedAt : previous?.sources?.find(p => p.name === s.name)?.lastSuccessAt || null })), lastAttemptAt: new Date(now).toISOString(), lastSuccessAt: good ? new Date(now).toISOString() : previous?.lastSuccessAt || null, notifications: { sent: 0, suppressed: 0, errors: 0 } };
  await store.set('snapshot', snapshot);
  // Baseline the first run, avoiding a burst of old reports during installation/reset.
  onProgress(`Saved ${reports.length} reports. Checking notification eligibility…`);
  const initialized = await store.get('initialized');
  for (const r of result.reports.filter(r => eligible(r, now)).slice(0, 20)) {
    if (Date.now() - startedAt > 3 * 60000) break;
    if (!await store.claim(`article:${r.id}`)) continue;
    if (!await store.claim(`headline:${r.fingerprint}`)) continue;
    if (!initialized) { snapshot.notifications.suppressed++; continue; }
    try { await sendFn(message(r)); snapshot.notifications.sent++; }
    catch { snapshot.notifications.errors++; }
  }
  if (good && !initialized) await store.set('initialized', true, 365 * 86400);
  await store.set('snapshot', snapshot);
  if (!good || snapshot.notifications.errors) throw new Error(!good ? 'All news sources failed; cached reports retained' : 'Telegram delivery failures; inspect run status');
  return snapshot;
}
