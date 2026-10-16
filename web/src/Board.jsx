import { CircleAlert, CircleCheck, Clock3, LoaderCircle, TriangleAlert } from 'lucide-react';
import { ago, fullDate } from './lib.js';

export const WINDOWS = [
  { hours: 2, label: 'Past 2 hours', short: '2 hours' },
  { hours: 6, label: 'Past 6 hours', short: '6 hours' },
  { hours: 24, label: 'Past 24 hours', short: '24 hours' },
  { hours: 168, label: 'Past 7 days', short: '7 days' }
];

const toneIcon = { success: CircleCheck, warning: Clock3, danger: CircleAlert, neutral: LoaderCircle };
const toneText = { success: 'text-board-ok', warning: 'text-board-warn', danger: 'text-board-bad', neutral: 'text-board-ink-2' };

export function Board({ data, health, counts, hours, onHours, now }) {
  const sources = data?.sources || [];
  const responding = sources.filter(s => s.ok).length;
  const Icon = health.label === 'Partial coverage' ? TriangleAlert : toneIcon[health.tone];
  return (
    <section aria-label="Collection status and time window" className="bg-board text-board-ink">
      <div className="mx-auto grid max-w-[1200px] gap-6 px-4 pb-5 pt-5 sm:px-6 sm:pb-7 sm:pt-6 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-end lg:gap-10 lg:pb-9 lg:pt-8">
        <div>
          <p className="text-sm text-board-ink-2">Last collection</p>
          <p className="tabular mt-1 text-[44px] font-bold leading-none tracking-tight sm:text-6xl">
            {data?.lastSuccessAt ? ago(data.lastSuccessAt, now) : '—'}
          </p>
          <p className={`mt-3 flex items-center gap-2 text-[15px] font-semibold ${toneText[health.tone]}`}>
            <Icon aria-hidden="true" className={`size-4 shrink-0 ${health.tone === 'neutral' ? 'animate-spin motion-reduce:animate-none' : ''}`} strokeWidth={2.4} />
            {health.label}
          </p>
          <p className="mt-1 text-sm text-board-ink-2">
            {sources.length ? `${responding} of ${sources.length} sources responded` : 'Source checks appear after the first collection'}
            {data?.lastSuccessAt ? ` · ${fullDate(data.lastSuccessAt)}` : ''}
          </p>
        </div>
        <div role="group" aria-label="Time window" className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {WINDOWS.map(w => {
            const on = w.hours === hours;
            return (
              <button key={w.hours} type="button" aria-pressed={on} onClick={() => onHours(w.hours)}
                className={`group rounded-md px-2.5 py-2.5 text-left transition-colors duration-200 sm:px-4 sm:py-4 ${on ? 'lamp-on bg-lamp text-lamp-ink' : 'bg-board-2 text-board-ink hover:bg-board-hover'} focus-visible:outline-lamp`}>
                <span className={`block text-[13px] sm:text-sm ${on ? 'font-semibold' : 'text-board-ink-2 group-hover:text-board-ink'}`}>
                  <span className="sm:hidden" aria-hidden="true">{w.short}</span><span className="hidden sm:inline">{w.label}</span><span className="sr-only sm:hidden">{w.label}</span>
                </span>
                <span className="tabular mt-0.5 block text-[28px] font-bold leading-tight sm:text-[44px]">{data?.lastSuccessAt ? counts[w.hours] : '—'}</span>
                <span className="sr-only"> reports{on ? ', showing' : ''}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
