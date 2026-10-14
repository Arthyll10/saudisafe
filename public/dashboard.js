export const HISTORY_WINDOW = 7 * 86400000;
export const STALE_AFTER = 45 * 60000;
export function reportTime(report) { return Date.parse(report.publishedAt || report.discoveredAt); }
export function recentReports(reports = [], now = Date.now()) {
  return reports.filter(r => Number.isFinite(reportTime(r)) && reportTime(r) <= now + 5 * 60000 && now - reportTime(r) <= HISTORY_WINDOW);
}
export function filterReports(reports, { query = '', category = '', status = '', hours = 168, sort = 'newest' } = {}, now = Date.now()) {
  const needle = query.trim().normalize('NFKC').toLocaleLowerCase();
  return recentReports(reports, now).filter(r =>
    (!category || r.category === category) && (!status || r.status === status) &&
    now - reportTime(r) <= Number(hours) * 3600000 &&
    (!needle || `${r.title} ${r.publisher}`.normalize('NFKC').toLocaleLowerCase().includes(needle))
  ).sort((a, b) => (sort === 'oldest' ? 1 : -1) * (reportTime(a) - reportTime(b)));
}
export function sourceState(source, now = Date.now()) {
  const checked = Date.parse(source.checkedAt);
  if (!Number.isFinite(checked)) return { label: 'Not checked', tone: 'neutral', symbol: '—' };
  if (now - checked > STALE_AFTER) return { label: 'Check overdue', tone: 'warning', symbol: '◷' };
  return source.ok ? { label: 'Responding', tone: 'success', symbol: '✓' } : { label: 'Unavailable', tone: 'danger', symbol: '!' };
}
export function healthState(data, failed = false, now = Date.now()) {
  if (failed) return { label: 'Connection issue', tone: 'danger', symbol: '!', detail: data ? 'Could not reload reports. Keeping the last loaded data; it may be incomplete or outdated.' : 'Could not load saved reports. Try reloading. If this continues, the operator should check storage configuration.' };
  if (!data?.lastSuccessAt) return { label: 'Awaiting first update', tone: 'neutral', symbol: '◷', detail: 'No successful collection is available yet. Reports appear after the monitor completes its first run.' };
  if (!Number.isFinite(Date.parse(data.lastSuccessAt)) || now - Date.parse(data.lastSuccessAt) > STALE_AFTER) return { label: 'Updates delayed', tone: 'warning', symbol: '◷', detail: 'The last successful collection was over 45 minutes ago. Recent reporting may be missing.' };
  if (data.sources?.some(s => !s.ok) || data.stale) return { label: 'Partial coverage', tone: 'warning', symbol: '!', detail: 'Some sources did not respond on the last check. Available reports are shown below.' };
  return { label: 'Collection up to date', tone: 'success', symbol: '✓', detail: 'The monitor completed a recent collection. Source availability does not confirm an incident or indicate that an area is safe.' };
}
