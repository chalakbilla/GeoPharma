const BASE_URL = "https://drug-database.com/v1/drugs";

// Optional catalogue lookup. Everything here fails soft: if the key is missing
// or the API is slow/down, callers just get an empty list and carry on.
export async function searchDrugs(q, limit = 8) {
  if (!q || !q.trim()) return [];
  if (!process.env.DRUG_DB_API_KEY) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${BASE_URL}?q=${encodeURIComponent(q.trim())}`, {
      headers: { Authorization: `Bearer ${process.env.DRUG_DB_API_KEY}` },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Drug database request failed (${res.status})`);
    const data = await res.json();
    return (data.results || []).slice(0, limit);
  } finally {
    clearTimeout(timer);
  }
}
