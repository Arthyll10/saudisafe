import { send } from '../src/telegram.js';
try { await send('🧪 <b>SAUDISAFE — TEST ONLY</b>\n\nThis is a configuration test. It does not describe an incident or an emergency.'); console.log('Test notification accepted by Telegram.'); }
catch (error) { console.error(error.message); process.exitCode = 1; }
