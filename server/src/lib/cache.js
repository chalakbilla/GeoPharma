// Tiny in-memory TTL cache. Lives per serverless instance, which is fine for
// trimming repeat AI/database calls (medicine search, medicine info).
const store = new Map();
const MAX_ENTRIES = 500;

export function cacheGet(key) {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return hit.value;
}

export function cacheSet(key, value, ttlMs = 30 * 60 * 1000) {
  if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value);
  store.set(key, { value, expires: Date.now() + ttlMs });
}
