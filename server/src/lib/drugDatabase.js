const BASE_URL = "https://drug-database.com/v1/drugs";

export async function searchDrugs(q, limit = 8) {
  if (!q || !q.trim()) return [];

  const url = `${BASE_URL}?q=${encodeURIComponent(q.trim())}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.DRUG_DB_API_KEY}` },
  });

  if (!res.ok) {
    throw new Error(`Drug database request failed (${res.status})`);
  }

  const data = await res.json();
  return (data.results || []).slice(0, limit);
}
