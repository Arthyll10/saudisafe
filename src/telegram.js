import { articleURL } from './sources.js';
import { sleep } from './http.js';
export const escapeHTML = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const saudiTime = date => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Riyadh', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date)) + ' AST (UTC+3)';
export function message(report) {
  if (!articleURL(report.url) || !report.publishedAt) throw new Error('Invalid alert');
  return `⚠️ <b>SAUDISAFE — DEVELOPING REPORT</b>\n\n<b>Headline:</b> ${escapeHTML(report.title.slice(0, 400))}\n\n📰 Source: ${escapeHTML(report.publisher)}\n🕒 Published: ${saudiTime(report.publishedAt)}\n🔎 Status: Developing Report\n\n🔗 <a href="${escapeHTML(report.url)}">Read original article</a>\n\nSaudiSafe is an independent news monitor, not an official emergency warning service.`;
}
export function telegramConfig(env = process.env) {
  if (!/^\d+:[\w-]+$/.test(env.TELEGRAM_BOT_TOKEN || '') || !/^(?:-?\d+|@[\w]{5,})$/.test(env.TELEGRAM_CHAT_ID || '')) throw new Error('Configure Telegram credentials');
  return { token: env.TELEGRAM_BOT_TOKEN, chat: env.TELEGRAM_CHAT_ID };
}
export async function send(text, { env = process.env, fetchFn = fetch, sleepFn = sleep } = {}) {
  const { token, chat } = telegramConfig(env);
  for (let attempt = 0; attempt < 3; attempt++) {
    let data, response;
    try {
      response = await fetchFn(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(12000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true } }) });
      data = await response.json();
    } catch { throw new Error('Telegram delivery uncertain; automatic resend suppressed'); }
    if (response.ok && data.ok) return data.result.message_id;
    // Only explicit rate-limit rejections are safe to retry; timeouts/5xx may already have delivered.
    if (data.error_code === 429 && attempt < 2 && Number.isFinite(data.parameters?.retry_after) && data.parameters.retry_after <= 30) { await sleepFn(Math.max(1, data.parameters.retry_after) * 1000); continue; }
    throw new Error(`Telegram rejected or uncertain (${Number(data.error_code) || response.status}); automatic resend suppressed`);
  }
}
