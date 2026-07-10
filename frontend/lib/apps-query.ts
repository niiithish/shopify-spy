import type { Client, Row } from "@libsql/client"
import type { AppsQueryParams, ShopifyApp, SortField } from "@/lib/types"

const ALLOWED_SORT: SortField[] = [
  "trending_score",
  "recent_reviews_30_days",
  "rating",
  "review_count",
  "created_at",
  "relevance_score",
  "title",
]

function mapApp(row: Row, favoritedIds?: Set<number>): ShopifyApp {
  const id = Number(row.id)
  return {
    id,
    keyword: String(row.keyword ?? ""),
    title: String(row.title ?? ""),
    url: row.url != null ? String(row.url) : null,
    rating: row.rating != null ? String(row.rating) : null,
    review_count: row.review_count != null ? String(row.review_count) : null,
    price: row.price != null ? String(row.price) : null,
    relevance_score:
      row.relevance_score != null ? Number(row.relevance_score) : null,
    recent_reviews_30_days:
      row.recent_reviews_30_days != null
        ? Number(row.recent_reviews_30_days)
        : null,
    trending_score:
      row.trending_score != null ? Number(row.trending_score) : null,
    created_at: row.created_at != null ? String(row.created_at) : null,
    updated_at: row.updated_at != null ? String(row.updated_at) : null,
    is_favorite: favoritedIds ? favoritedIds.has(id) : Boolean(row.is_favorite),
  }
}

export async function getFavoriteIds(
  db: Client,
  clientId?: string
): Promise<Set<number>> {
  if (!clientId) return new Set()
  const result = await db.execute({
    sql: `SELECT app_id FROM favorites WHERE client_id = ? OR client_id = ''`,
    args: [clientId],
  })
  return new Set(result.rows.map((r) => Number(r.app_id)))
}

export async function queryApps(db: Client, params: AppsQueryParams) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 24))
  const offset = (page - 1) * pageSize
  const sort = ALLOWED_SORT.includes(params.sort as SortField)
    ? (params.sort as SortField)
    : "trending_score"
  const order = params.order === "asc" ? "ASC" : "DESC"

  const where: string[] = []
  const args: Array<string | number> = []

  if (params.search?.trim()) {
    where.push(`(title LIKE ? OR keyword LIKE ? OR url LIKE ?)`)
    const q = `%${params.search.trim()}%`
    args.push(q, q, q)
  }

  if (params.keyword?.trim()) {
    where.push(`keyword = ?`)
    args.push(params.keyword.trim())
  }

  if (params.price && params.price !== "all") {
    where.push(`price = ?`)
    args.push(params.price)
  }

  if (params.minRating != null && !Number.isNaN(params.minRating)) {
    where.push(`CAST(rating AS REAL) >= ?`)
    args.push(params.minRating)
  }

  if (params.maxRating != null && !Number.isNaN(params.maxRating)) {
    where.push(`CAST(rating AS REAL) <= ?`)
    args.push(params.maxRating)
  }

  if (params.minReviews != null && !Number.isNaN(params.minReviews)) {
    where.push(`CAST(review_count AS INTEGER) >= ?`)
    args.push(params.minReviews)
  }

  if (params.maxReviews != null && !Number.isNaN(params.maxReviews)) {
    where.push(`CAST(review_count AS INTEGER) <= ?`)
    args.push(params.maxReviews)
  }

  if (params.minTrending != null && !Number.isNaN(params.minTrending)) {
    where.push(`trending_score >= ?`)
    args.push(params.minTrending)
  }

  if (params.maxTrending != null && !Number.isNaN(params.maxTrending)) {
    where.push(`trending_score <= ?`)
    args.push(params.maxTrending)
  }

  if (
    params.minRecentReviews != null &&
    !Number.isNaN(params.minRecentReviews)
  ) {
    where.push(`recent_reviews_30_days >= ?`)
    args.push(params.minRecentReviews)
  }

  if (
    params.maxRecentReviews != null &&
    !Number.isNaN(params.maxRecentReviews)
  ) {
    where.push(`recent_reviews_30_days <= ?`)
    args.push(params.maxRecentReviews)
  }

  if (params.mode === "trending") {
    where.push(`trending_score >= 50`)
  } else if (params.mode === "opportunities") {
    // Rising apps with limited reviews — good replication targets
    where.push(`CAST(review_count AS INTEGER) BETWEEN 1 AND 50`)
    where.push(`CAST(rating AS REAL) >= 4.0`)
    where.push(`recent_reviews_30_days >= 1`)
  } else if (params.mode === "new") {
    where.push(`created_at >= datetime('now', '-14 days')`)
  }

  if (params.favoritesOnly && params.clientId) {
    where.push(
      `id IN (SELECT app_id FROM favorites WHERE client_id = ? OR client_id = '')`
    )
    args.push(params.clientId)
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""

  // Numeric sorts need cast for rating / review_count stored as TEXT
  let orderExpr: string = sort
  if (sort === "rating") orderExpr = "CAST(rating AS REAL)"
  if (sort === "review_count") orderExpr = "CAST(review_count AS INTEGER)"

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM search_results ${whereSql}`,
    args,
  })
  const total = Number(countResult.rows[0]?.total ?? 0)

  const listResult = await db.execute({
    sql: `
      SELECT * FROM search_results
      ${whereSql}
      ORDER BY ${orderExpr} ${order} NULLS LAST, id DESC
      LIMIT ? OFFSET ?
    `,
    args: [...args, pageSize, offset],
  })

  const favoritedIds = await getFavoriteIds(db, params.clientId)
  const apps = listResult.rows.map((row) => mapApp(row, favoritedIds))

  return {
    apps,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getAppById(
  db: Client,
  id: number,
  clientId?: string
): Promise<ShopifyApp | null> {
  const result = await db.execute({
    sql: `SELECT * FROM search_results WHERE id = ? LIMIT 1`,
    args: [id],
  })
  if (!result.rows[0]) return null
  const favoritedIds = await getFavoriteIds(db, clientId)
  return mapApp(result.rows[0], favoritedIds)
}
