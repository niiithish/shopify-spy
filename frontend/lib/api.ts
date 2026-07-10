import type {
  AppsQueryParams,
  AppsResponse,
  DashboardStats,
  KeywordsResponse,
  ShopifyApp,
} from "@/lib/types"

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === false) continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function fetchApps(params: AppsQueryParams = {}): Promise<AppsResponse> {
  return getJson<AppsResponse>(
    `/api/apps${buildQuery({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      keyword: params.keyword,
      price: params.price,
      sort: params.sort,
      order: params.order,
      minRating: params.minRating,
      maxRating: params.maxRating,
      minReviews: params.minReviews,
      maxReviews: params.maxReviews,
      minRecentReviews: params.minRecentReviews,
      maxRecentReviews: params.maxRecentReviews,
      minTrending: params.minTrending,
      maxTrending: params.maxTrending,
      mode: params.mode,
      favoritesOnly: params.favoritesOnly,
      clientId: params.clientId,
    })}`
  )
}

export async function fetchApp(id: number, clientId?: string): Promise<ShopifyApp> {
  return getJson<ShopifyApp>(
    `/api/apps/${id}${buildQuery({ clientId })}`
  )
}

export async function fetchKeywords(search?: string): Promise<KeywordsResponse> {
  return getJson<KeywordsResponse>(
    `/api/keywords${buildQuery({ search })}`
  )
}

export async function fetchStats(clientId?: string): Promise<DashboardStats> {
  return getJson<DashboardStats>(
    `/api/stats${buildQuery({ clientId })}`
  )
}

export async function fetchFavorites(clientId: string): Promise<AppsResponse> {
  return getJson<AppsResponse>(
    `/api/favorites${buildQuery({ clientId })}`
  )
}

export async function toggleFavorite(
  appId: number,
  clientId: string,
  favorited: boolean
): Promise<{ ok: boolean; favorited: boolean }> {
  const res = await fetch("/api/favorites", {
    method: favorited ? "DELETE" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appId, clientId }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}
