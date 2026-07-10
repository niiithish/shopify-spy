export type ShopifyApp = {
  id: number
  keyword: string
  title: string
  url: string | null
  rating: string | null
  review_count: string | null
  price: string | null
  relevance_score: number | null
  recent_reviews_30_days: number | null
  trending_score: number | null
  created_at: string | null
  updated_at: string | null
  is_favorite?: boolean
}

export type KeywordStat = {
  keyword: string
  app_count: number
  avg_rating: number | null
  avg_trending: number | null
  max_trending: number | null
  total_recent_reviews: number | null
  free_count: number
  paid_count: number
}

export type DashboardStats = {
  total_apps: number
  unique_keywords: number
  avg_trending: number | null
  avg_rating: number | null
  free_apps: number
  free_trial_apps: number
  paid_apps: number
  high_trending: number
  new_opportunities: number
  favorites_count: number
}

export type AppsResponse = {
  apps: ShopifyApp[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type KeywordsResponse = {
  keywords: KeywordStat[]
  total: number
}

export type SortField =
  | "trending_score"
  | "recent_reviews_30_days"
  | "rating"
  | "review_count"
  | "created_at"
  | "relevance_score"
  | "title"

export type SortOrder = "asc" | "desc"

export type AppsQueryParams = {
  page?: number
  pageSize?: number
  search?: string
  keyword?: string
  price?: string
  sort?: SortField
  order?: SortOrder
  minRating?: number
  maxRating?: number
  minReviews?: number
  maxReviews?: number
  minRecentReviews?: number
  maxRecentReviews?: number
  minTrending?: number
  maxTrending?: number
  mode?: "all" | "trending" | "opportunities" | "new"
  favoritesOnly?: boolean
  clientId?: string
}
