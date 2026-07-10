import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import type { KeywordStat } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search")?.trim()
    const db = getDb()

    const args: string[] = []
    let where = ""
    if (search) {
      where = "WHERE keyword LIKE ?"
      args.push(`%${search}%`)
    }

    const result = await db.execute({
      sql: `
        SELECT
          keyword,
          COUNT(*) as app_count,
          AVG(CAST(rating AS REAL)) as avg_rating,
          AVG(trending_score) as avg_trending,
          MAX(trending_score) as max_trending,
          SUM(recent_reviews_30_days) as total_recent_reviews,
          SUM(CASE WHEN price = 'Free' THEN 1 ELSE 0 END) as free_count,
          SUM(CASE WHEN price = 'Paid' OR price = 'Free trial' THEN 1 ELSE 0 END) as paid_count
        FROM search_results
        ${where}
        GROUP BY keyword
        ORDER BY max_trending DESC, total_recent_reviews DESC, app_count DESC
      `,
      args,
    })

    const keywords: KeywordStat[] = result.rows.map((row) => ({
      keyword: String(row.keyword ?? ""),
      app_count: Number(row.app_count ?? 0),
      avg_rating: row.avg_rating != null ? Number(row.avg_rating) : null,
      avg_trending: row.avg_trending != null ? Number(row.avg_trending) : null,
      max_trending: row.max_trending != null ? Number(row.max_trending) : null,
      total_recent_reviews:
        row.total_recent_reviews != null
          ? Number(row.total_recent_reviews)
          : null,
      free_count: Number(row.free_count ?? 0),
      paid_count: Number(row.paid_count ?? 0),
    }))

    return NextResponse.json({ keywords, total: keywords.length })
  } catch (error) {
    console.error("GET /api/keywords", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch keywords",
      },
      { status: 500 }
    )
  }
}
