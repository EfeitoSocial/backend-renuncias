// lib/cache.js
import NodeCache from "node-cache";

// Usa globalThis para tentar preservar o cache entre invocações "quentes" no ambiente serverless
if (!globalThis.__MY_ANALYSIS_CACHE) {
  // stdTTL em segundos (ex.: 3600 = 1h)
  globalThis.__MY_ANALYSIS_CACHE = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
}

const cache = globalThis.__MY_ANALYSIS_CACHE;

export default {
  get(key) { return cache.get(key); },
  set(key, value, ttl) { return cache.set(key, value, ttl); },
  has(key) { return cache.has(key); },
  del(key) { return cache.del(key); },
  flush() { return cache.flushAll(); },
};
