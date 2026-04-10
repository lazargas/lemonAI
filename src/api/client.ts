const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function ping() {
  const res = await fetch(`${BASE_URL}/api/v1/ping`)
  if (!res.ok) throw new Error(`Ping failed: ${res.status}`)
  return res.json()
}
