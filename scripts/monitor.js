import { Store } from '../src/store.js';
import { monitor } from '../src/monitor.js';
import { telegramConfig } from '../src/telegram.js';
try { telegramConfig(); const result = await monitor({ store: new Store(), onProgress: text => console.log(text) }); console.log(JSON.stringify({ lastSuccessAt: result.lastSuccessAt, reports: result.reports.length, sources: result.sources, notifications: result.notifications })); }
catch (error) { if (error.locked) console.log(error.message); else { console.error(error.message); process.exitCode = 1; } }
