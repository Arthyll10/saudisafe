import { recentReports, filterReports, sourceState, healthState } from './dashboard.js';
const $ = id => document.getElementById(id);
let data = null, failed = false, loading = false, loadedAt = null, renderKey = '';
const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Riyadh', dateStyle: 'medium', timeStyle: 'short' });
const date = value => Number.isFinite(Date.parse(value)) ? formatter.format(new Date(value)) + ' AST' : 'Not available';
function ago(value) {
  const age = Date.now() - Date.parse(value);
  if (!Number.isFinite(age)) return 'Not available';
  const minutes = Math.max(0, Math.floor(age / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  return `${Math.floor(minutes / 1440)} day${minutes >= 2880 ? 's' : ''} ago`;
}
function node(tag, text, className) { const element = document.createElement(tag); element.textContent = text; if (className) element.className = className; return element; }
function options() { return { query: $('search').value, category: $('category').value, status: $('status').value, hours: $('hours').value, sort: $('sort').value }; }
function isFiltered() { const o = options(); return !!(o.query.trim() || o.category || o.status || o.hours !== '168'); }
function resetFilters() { $('search').value = ''; $('category').value = ''; $('status').value = ''; $('hours').value = '168'; $('sort').value = 'newest'; render(); }
const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' });
const dayName = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Riyadh', weekday: 'long', day: 'numeric', month: 'long' });
function dayLabel(value) {
  const key = dayKey.format(new Date(value)), today = dayKey.format(new Date()), yesterday = dayKey.format(new Date(Date.now() - 86400000));
  return key === today ? `Today · ${dayName.format(new Date(value))}` : key === yesterday ? `Yesterday · ${dayName.format(new Date(value))}` : dayName.format(new Date(value));
}
function reportCard(report) {
  const stamp = report.publishedAt || report.discoveredAt;
  const card = node('article', '', 'report'), main = node('div', '', 'report-main');
  const time = node('time', clock.format(new Date(stamp)), 'report-time'); time.dateTime = stamp; time.title = date(stamp);
  const title = node('h3', ''); title.dir = 'auto';
  let link = null;
  try {
    const url = new URL(report.url);
    if (url.protocol === 'https:' && !url.username && !url.password) {
      link = node('a', report.title); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${report.title} (${report.publisher}, opens in a new tab)`);
    }
  } catch {}
  title.append(link || document.createTextNode(report.title));
  const meta = node('p', '', 'report-meta');
  const developing = report.status === 'Developing Report';
  const status = node('span', developing ? 'Developing report' : 'Unverified', `status-tag ${developing ? 'developing' : 'unverified'}`);
  status.title = report.statusReason || '';
  const age = node('span', report.publishedAt ? `Published ${ago(report.publishedAt).toLowerCase()}` : 'Publication time unknown');
  if (report.publishedAt) age.dataset.publishedAt = report.publishedAt;
  meta.append(node('span', report.publisher, 'publisher'), node('span', report.category), status, age);
  main.append(title, meta);
  card.append(time, main); return card;
}
function reportRows(reports) {
  const rows = []; let current = '';
  for (const report of reports) {
    const stamp = report.publishedAt || report.discoveredAt, key = dayKey.format(new Date(stamp));
    if (key !== current) { current = key; rows.push(node('h3', dayLabel(stamp), 'day')); }
    rows.push(reportCard(report));
  }
  return rows;
}
function render() {
  const state = healthState(data, failed);
  $('health-label').className = `tone-${state.tone}`;
  $('health-label').textContent = state.label;
  $('notice').className = `notice tone-${state.tone}`;
  $('notice-text').textContent = state.detail;
  $('updated').textContent = ago(data?.lastSuccessAt);
  $('updated-exact').textContent = data?.lastSuccessAt ? date(data.lastSuccessAt) : 'All times in Saudi Arabia · UTC+3';
  const all = recentReports(data?.reports || []), reports = filterReports(all, options());
  $('total-count').textContent = data?.lastSuccessAt ? String(all.length) : '—';
  $('count').textContent = `${reports.length} of ${all.length} report${all.length === 1 ? '' : 's'}`;
  $('clear').hidden = !isFiltered();
  const key = JSON.stringify([reports, options(), !!data?.lastSuccessAt, failed]);
  if (key !== renderKey) {
    renderKey = key;
    $('report-list').replaceChildren();
    if (!reports.length) {
      const empty = node('div', '', 'empty');
            const title = isFiltered() && all.length ? 'No reports match your filters' : failed && !data ? 'The news desk is unavailable' : data?.lastSuccessAt ? 'No matching reports in the past 7 days' : 'Awaiting the first collection';
      const description = isFiltered() && all.length ? 'Try another search or widen the time window to see more reporting.' : failed && !data ? 'Reload to try again. If this continues, the operator should check the monitor and storage connection.' : data?.lastSuccessAt ? 'No eligible coverage is saved for this window. Missing reports do not mean an area is safe.' : 'Reports will appear after a successful monitoring run. This page does not start a collection.';
      empty.append(node('h3', title), node('p', description));
      if (isFiltered()) { const reset = node('button', 'Clear filters', 'button'); reset.type = 'button'; reset.onclick = resetFilters; empty.append(reset); }
      $('report-list').append(empty);
    } else { $('report-list').append(...reportRows(reports)); }
    $('report-list').classList.remove('feed-enter');
    requestAnimationFrame(() => $('report-list').classList.add('feed-enter'));
  }
  for (const label of $('report-list').querySelectorAll('[data-published-at]')) label.textContent = `Published ${ago(label.dataset.publishedAt).toLowerCase()}`;
  const sources = data?.sources || [];
  // Count the last check's outcome; overdue checks are flagged by the collection status and source panel.
  const responding = sources.filter(s => s.ok).length;
  $('source-count').replaceChildren(document.createTextNode(sources.length ? `${responding} ` : '— '), node('span', `of ${sources.length || '—'}`));
  $('sources').replaceChildren();
  for (const source of sources) {
    const status = sourceState(source), item = node('li', '');
    item.append(node('span', source.name, 'source-name'), node('span', status.label, `source-state tone-${status.tone}`));
    const detail = source.ok ? `${Number.isInteger(source.matchingCount) ? `${source.matchingCount} matching · ` : ''}checked ${ago(source.checkedAt).toLowerCase()}` : `Last success: ${date(source.lastSuccessAt)}`;
    item.append(node('span', detail, 'source-detail'));
    item.title = `Checked: ${date(source.checkedAt)}. Last success: ${date(source.lastSuccessAt)}`;
    $('sources').append(item);
  }
  if (!sources.length) $('sources').append(node('li', 'Source checks appear after the first collection.'));
  if (loadedAt) $('page-updated').textContent = `Page loaded ${ago(loadedAt).toLowerCase()} · reloads every 5 minutes`;
}
async function refresh() {
  if (loading) return;
  loading = true; $('refresh').disabled = true; $('refresh').classList.add('is-loading'); $('refresh-label').textContent = 'Loading…'; $('report-list').setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('/api/reports', { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Unavailable');
    const next = await response.json();
    if (!Array.isArray(next.reports) || !Array.isArray(next.sources)) throw new Error('Invalid response');
    data = next; failed = false; loadedAt = new Date().toISOString();
  } catch { failed = true; }
  finally { loading = false; render(); $('refresh').disabled = false; $('refresh').classList.remove('is-loading'); $('refresh-label').textContent = 'Reload reports'; $('report-list').setAttribute('aria-busy', 'false'); }
}
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('theme').textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  $('theme').setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}
let preference; try { preference = localStorage.getItem('saudisafe-theme'); } catch {}
setTheme(['dark', 'light'].includes(preference) ? preference : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
$('theme').onclick = () => { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(theme); try { localStorage.setItem('saudisafe-theme', theme); } catch {} };
$('refresh').onclick = refresh; $('clear').onclick = resetFilters;
for (const id of ['category', 'status', 'hours', 'sort']) $(id).onchange = render;
$('search').oninput = render;
refresh(); setInterval(() => { if (!document.hidden) refresh(); }, 5 * 60000);
setInterval(() => { if (!document.hidden && !loading) render(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && (!loadedAt || Date.now() - Date.parse(loadedAt) > 5 * 60000)) refresh(); });
