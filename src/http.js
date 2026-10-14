export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function request(url, { fetchFn = fetch, retries = 2, ...options } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetchFn(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(12000) });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.retryable = response.status === 429 || response.status >= 500;
        throw error;
      }
      const reader = response.body.getReader(); let size = 0; const chunks = [];
      for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length;
        if (size > 3_000_000) { await reader.cancel(); throw new Error('Response too large'); } chunks.push(Buffer.from(value)); }
      return Buffer.concat(chunks).toString('utf8');
    } catch (error) {
      if (attempt >= retries || error.retryable === false || error.message === 'Response too large') throw new Error('Upstream request failed');
      await sleep(500 * 2 ** attempt);
    }
  }
}
