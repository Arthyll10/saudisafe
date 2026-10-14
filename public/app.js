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
function reportCard(report) {
  const card = node('article', '', 'report'), body = node('div', '', 'report-body');
  const top = node('div', '', 'report-top');
  const developing = report.status === 'Developing Report';
  const badge = node('span', '', `badge ${developing ? 'developing' : 'unverified'}`);
  const icon = node('span', developing ? '◷' : '?'); icon.setAttribute('aria-hidden', 'true');
  badge.append(icon, document.createTextNode(report.status));
  const categories = { 'Missile & drone': '◇', 'Explosion & fire': '△', Emergency: '⊕', Security: '▣' };
  top.append(badge, node('span', `${categories[report.category] || '•'} ${report.category}`, 'category-tag'));
  const title = node('h3', report.title); title.dir = 'auto';
  const publication = node('p', '', 'publication');
  publication.append(node('strong', report.publisher), document.createTextNode(' · '));
  const time = node('time', date(report.publishedAt || report.discoveredAt));
  time.dateTime = report.publishedAt || report.discoveredAt;
  publication.append(document.createTextNode(report.publishedAt ? 'Published ' : 'Discovered '), time);
  body.append(top, title, publication, node('p', report.statusReason, 'report-reason'));
  const bottom = node('div', '', 'report-bottom');
  const age = node('span', report.publishedAt ? `Published ${ago(report.publishedAt).toLowerCase()}` : 'Publication time unknown');
  if (report.publishedAt) age.dataset.publishedAt = report.publishedAt;
  bottom.append(age);
  try {
    const url = new URL(report.url);
    if (url.protocol === 'https:' && !url.username && !url.password) {
      const link = node('a', 'Read source ↗', 'source-link'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `Read source: ${report.title} (opens in a new tab)`); bottom.append(link);
    }
  } catch {}
  card.append(body, bottom); return card;
}
function render() {
  const state = healthState(data, failed);
  $('health-label').className = `tone-${state.tone}`;
  $('health-label').textContent = `${state.symbol} ${state.label}`;
  $('notice').className = `notice tone-${state.tone}`;
  $('notice-icon').textContent = state.symbol; $('notice-text').textContent = state.detail;
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
      empty.append(node('span', isFiltered() ? '⌕' : '▤', 'empty-icon'));
      const title = isFiltered() && all.length ? 'No reports match your filters' : failed && !data ? 'The news desk is unavailable' : data?.lastSuccessAt ? 'No matching reports in the past 7 days' : 'Awaiting the first collection';
      const description = isFiltered() && all.length ? 'Try another search or widen the time window to see more reporting.' : failed && !data ? 'Reload to try again. If this continues, the operator should check the monitor and storage connection.' : data?.lastSuccessAt ? 'No eligible coverage is saved for this window. Missing reports do not mean an area is safe.' : 'Reports will appear after a successful monitoring run. This page does not start a collection.';
      empty.append(node('h3', title), node('p', description));
      if (isFiltered()) { const reset = node('button', 'Clear filters', 'button'); reset.type = 'button'; reset.onclick = resetFilters; empty.append(reset); }
      $('report-list').append(empty);
    } else { $('report-list').append(...reports.map(reportCard)); }
    $('report-list').classList.remove('feed-enter');
    requestAnimationFrame(() => $('report-list').classList.add('feed-enter'));
  }
  for (const label of $('report-list').querySelectorAll('[data-published-at]')) label.textContent = `Published ${ago(label.dataset.publishedAt).toLowerCase()}`;
  const sources = data?.sources || [];
  const responding = sources.filter(s => sourceState(s).tone === 'success').length;
  $('source-count').replaceChildren(document.createTextNode(sources.length ? `${responding} ` : '— '), node('span', `of ${sources.length || '—'}`));
  $('sources').replaceChildren();
  for (const source of sources) {
    const status = sourceState(source), row = node('div', '', 'source-row'), item = node('li', '');
    row.append(node('span', source.name), node('span', `${status.symbol} ${status.label}`, `source-badge tone-${status.tone}`));
    item.append(row, node('small', `Checked ${ago(source.checkedAt).toLowerCase()}`));
    if (Number.isInteger(source.matchingCount)) item.append(node('small', `${source.matchingCount} matching report${source.matchingCount === 1 ? '' : 's'} in this collection`));
    item.title = `Checked: ${date(source.checkedAt)}. Last success: ${date(source.lastSuccessAt)}`;
    if (!source.ok) item.append(node('small', `Last success: ${date(source.lastSuccessAt)}`));
    $('sources').append(item);
  }
  if (!sources.length) $('sources').append(node('li', 'Source checks appear after the first collection.'));
  if (loadedAt) $('page-updated').textContent = `Page loaded ${ago(loadedAt).toLowerCase()} · Auto-reload every 5 min`;
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
  $('theme').replaceChildren(document.createTextNode(theme === 'dark' ? '☀ ' : '◐ '), node('span', theme === 'dark' ? 'Light' : 'Dark'));
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
