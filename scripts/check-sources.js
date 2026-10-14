import { collect } from '../src/collector.js';
console.log('Checking public feeds only. No reports are saved and no Telegram messages are sent.');
try {
  const result = await collect({ onProgress: text => console.log(text) });
  const responding = result.sources.filter(source => source.ok).length;
  console.log(`${responding}/${result.sources.length} sources responding; ${result.reports.length} unique matching reports in the past seven days.`);
  if (responding === 0) process.exitCode = 1;
} catch { console.error('Source check failed.'); process.exitCode = 1; }
