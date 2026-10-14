import { request } from './http.js';
export class Store {
  constructor(env = process.env) {
    const u = new URL(env.UPSTASH_REDIS_REST_URL || 'https://missing.invalid');
    if (u.protocol !== 'https:' || !u.hostname.endsWith('.upstash.io') || u.username || u.password || u.port || u.pathname !== '/' || u.search || !env.UPSTASH_REDIS_REST_TOKEN) throw new Error('Configure Upstash credentials');
    this.url = u.href; this.token = env.UPSTASH_REDIS_REST_TOKEN;
  }
  async command(...command) {
    const data = JSON.parse(await request(this.url, { method: 'POST', retries: 0, headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command) }));
    if (data.error) throw new Error('Storage command failed'); return data.result;
  }
  async get(key) { const value = await this.command('GET', `saudisafe:${key}`); return value ? JSON.parse(value) : null; }
  set(key, value, ttl = 7 * 86400) { return this.command('SET', `saudisafe:${key}`, JSON.stringify(value), 'EX', ttl); }
  release(key) { return this.command('DEL', `saudisafe:${key}`); }
  async claim(key, ttl = 30 * 86400) { return (await this.command('SET', `saudisafe:${key}`, 'true', 'NX', 'EX', ttl)) === 'OK'; }
}
