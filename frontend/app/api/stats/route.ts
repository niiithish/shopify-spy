import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import type { DashboardStats } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId") || ""
    const db = getDb()

    const result = await db.execute({
      sql: `
        SELECT
          (SELECT COUNT(*) FROM search_results) as total_apps,
          (SELECT COUNT(DISTINCT keyword) FROM search_results) as unique_keywords,
          (SELECT AVG(trending_score) FROM search_results) as avg_trending,
          (SELECT AVG(CAST(rating AS REAL)) FROM search_results WHERE rating IS NOT NULL AND rating != '') as avg_rating,
          (SELECT COUNT(*) FROM search_results WHERE price = 'Free') as free_apps,
          (SELECT COUNT(*) FROM search_results WHERE price = 'Free trial') as free_trial_apps,
          (SELECT COUNT(*) FROM search_results WHERE price = 'Paid') as paid_apps,
          (SELECT COUNT(*) FROM search_results WHERE trending_score >= 70) as high_trending,
          (SELECT COUNT(*) FROM search_results
            WHERE CAST(review_count AS INTEGER) BETWEEN 1 AND 50
              AND CAST(rating AS REAL) >= 4.0
              AND recent_reviews_30_days >= 1) as new_opportunities,
          (SELECT COUNT(*) FROM favorites WHERE client_id = ? OR client_id = '') as favorites_count
      `,
      args: [clientId],
    })

    const row = result.rows[0]
    const stats: DashboardStats = {
      total_apps: Number(row?.total_apps ?? 0),
      unique_keywords: Number(row?.unique_keywords ?? 0),
      avg_trending: row?.avg_trending != null ? Number(row.avg_trending) : null,
      avg_rating: row?.avg_rating != null ? Number(row.avg_rating) : null,
      free_apps: Number(row?.free_apps ?? 0),
      free_trial_apps: Number(row?.free_trial_apps ?? 0),
      paid_apps: Number(row?.paid_apps ?? 0),
      high_trending: Number(row?.high_trending ?? 0),
      new_opportunities: Number(row?.new_opportunities ?? 0),
      favorites_count: Number(row?.favorites_count ?? 0),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("GET /api/stats", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch stats",
      },
      { status: 500 }
    )
  }
}
