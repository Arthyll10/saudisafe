import { ArrowUpRight, Search, SearchX, RefreshCw, Newspaper } from 'lucide-react';
import { clock, dayKey, dayLabel, fullDate, plural, safeLink } from './lib.js';
import { WINDOWS } from './Board.jsx';

const CATEGORIES = ['Missile & drone', 'Explosion & fire', 'Emergency', 'Security'];
const control = 'h-10 rounded-md border border-line bg-surface px-3 text-[15px] text-ink transition-colors hover:border-ink-2';

export function Toolbar({ query, setQuery, category, setCategory, sort, setSort, onReload, loading }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2.5 sm:gap-3 xl:grid-cols-[minmax(0,1fr)_190px_150px_auto]">
      <label className="relative col-span-3 min-w-0 xl:col-span-1">
        <span className="sr-only">Search headlines or publishers</span>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-2" />
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} maxLength={150} autoComplete="off"
          placeholder="Search headlines or publishers" className={`${control} w-full pl-9 placeholder:text-ink-2`} />
      </label>
      <label className="min-w-0">
        <span className="sr-only">Category</span>
        <select value={category} onChange={e => setCategory(e.target.value)} className={`${control} w-full`}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className="min-w-0">
        <span className="sr-only">Order</span>
        <select value={sort} onChange={e => setSort(e.target.value)} className={`${control} w-full`}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </label>
      <button type="button" onClick={onReload} disabled={loading} aria-label="Reload reports"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-3 sm:px-4 text-[15px] font-semibold text-white transition-[opacity,transform] hover:opacity-90 active:translate-y-px disabled:cursor-progress disabled:opacity-60 dark:text-[#06130b]">
        <RefreshCw aria-hidden="true" className={`size-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} />
        <span className="hidden sm:inline">{loading ? 'Loading…' : 'Reload'}</span>
      </button>
    </div>
  );
}

function Report({ report }) {
  const stamp = report.publishedAt || report.discoveredAt;
  const link = safeLink(report.url);
  const developing = report.status === 'Developing Report';
  return (
    <article className="row-in grid grid-cols-[52px_minmax(0,1fr)] gap-x-4 border-b border-line py-4 last:border-b-0 sm:grid-cols-[64px_minmax(0,1fr)]">
      <time dateTime={stamp} title={fullDate(stamp)} className="tabular pt-0.5 text-lg font-bold text-ink sm:text-xl">{clock(stamp)}</time>
      <div className="min-w-0">
        <h3 dir="auto" className="text-[17px] font-semibold leading-snug text-pretty sm:text-lg">
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`${report.title} (${report.publisher}, opens in a new tab)`}
              className="decoration-brand decoration-1 underline-offset-[3px] hover:text-brand hover:underline">
              {report.title}<ArrowUpRight aria-hidden="true" className="ml-1 inline size-4 align-[-2px] text-ink-2" />
            </a>
          ) : report.title}
        </h3>
        <p className="mt-1.5 flex min-w-0 items-center gap-x-2 whitespace-nowrap text-sm text-ink-2">
          <span className="min-w-0 truncate font-semibold text-ink">{report.publisher}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{report.category}</span>
          {developing
            ? <><span aria-hidden="true" className="hidden sm:inline">·</span><span title={report.statusReason} className="hidden shrink-0 sm:inline">Developing</span></>
            : <span title={report.statusReason} className="shrink-0 rounded-full bg-surface-2 px-2 py-px text-[13px] font-semibold text-ink">Unverified</span>}
        </p>
      </div>
    </article>
  );
}

function groupByDay(reports) {
  const groups = [];
  for (const report of reports) {
    const stamp = report.publishedAt || report.discoveredAt, key = dayKey(stamp);
    if (groups.at(-1)?.key !== key) groups.push({ key, stamp, reports: [] });
    groups.at(-1).reports.push(report);
  }
  return groups;
}

export function Feed({ reports, total, data, failed, loading, filtered, hours, onClear, now, limit, onMore }) {
  if (!data && loading) return (
    <div aria-hidden="true" className="divide-y divide-line">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="grid grid-cols-[64px_1fr] gap-4 py-5">
          <span className="h-5 w-12 animate-pulse rounded bg-surface-2" />
          <div className="space-y-2.5"><span className="block h-5 w-11/12 animate-pulse rounded bg-surface-2" /><span className="block h-4 w-2/5 animate-pulse rounded bg-surface-2" /></div>
        </div>
      ))}
    </div>
  );
  if (!reports.length) {
    const label = WINDOWS.find(w => w.hours === hours)?.label.toLowerCase();
    const [Icon, title, text] = filtered && total
      ? [SearchX, 'No reports match', `Nothing in the ${label} matches your search or category. Try a wider time window.`]
      : failed && !data ? [Newspaper, 'Reports are unavailable', 'The page could not load saved reports. Try reloading; if this continues, storage may be misconfigured.']
      : data?.lastSuccessAt ? [Newspaper, `No reports in the ${label}`, 'No matching coverage is saved for this window. A missing report does not mean an area is safe.']
      : [Newspaper, 'Waiting for the first collection', 'Reports appear after the monitor completes a run. This page never starts a collection.'];
    return (
      <div className="px-4 py-14 text-center">
        <Icon aria-hidden="true" className="mx-auto size-7 text-ink-2" />
        <h3 className="mt-3 text-lg font-semibold">{title}</h3>
        <p className="mx-auto mt-2 max-w-[46ch] text-[15px] text-ink-2">{text}</p>
        {filtered && <button type="button" onClick={onClear} className="mt-4 text-[15px] font-semibold text-brand underline underline-offset-[3px]">Clear filters</button>}
      </div>
    );
  }
  const shown = reports.slice(0, limit), rest = reports.length - shown.length;
  return <>
    {groupByDay(shown).map(group => (
    <section key={group.key} aria-label={dayLabel(group.stamp, now)}>
      <h3 className="sticky top-14 z-[1] flex items-baseline justify-between border-b-2 border-ink bg-ground pb-2 pt-5 text-sm font-bold uppercase tracking-wide text-ink">
        {dayLabel(group.stamp, now)}<span className="font-medium text-ink-2">{plural(group.reports.length, 'report')}</span>
      </h3>
      {group.reports.map(r => <Report key={r.id} report={r} />)}
    </section>
    ))}
    {rest > 0 && (
      <button type="button" onClick={onMore}
        className="my-3 h-11 w-full rounded-md bg-surface-2 text-[15px] font-semibold text-ink transition-colors hover:bg-line">
        Show {Math.min(rest, 30)} more <span className="font-normal text-ink-2">· {rest} not shown</span>
      </button>
    )}
  </>;
}
