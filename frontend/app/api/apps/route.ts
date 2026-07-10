import { NextRequest, NextResponse } from "next/server"
import { queryApps } from "@/lib/apps-query"
import { getDb } from "@/lib/db"
import type { AppsQueryParams, SortField, SortOrder } from "@/lib/types"

function optionalNumber(value: string | null): number | undefined {
  if (value === null || value === "") return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams

    const params: AppsQueryParams = {
      page: Number(sp.get("page") || 1),
      pageSize: Number(sp.get("pageSize") || 24),
      search: sp.get("search") || undefined,
      keyword: sp.get("keyword") || undefined,
      price: sp.get("price") || undefined,
      sort: (sp.get("sort") as SortField) || "trending_score",
      order: (sp.get("order") as SortOrder) || "desc",
      minRating: optionalNumber(sp.get("minRating")),
      maxRating: optionalNumber(sp.get("maxRating")),
      minReviews: optionalNumber(sp.get("minReviews")),
      maxReviews: optionalNumber(sp.get("maxReviews")),
      minRecentReviews: optionalNumber(sp.get("minRecentReviews")),
      maxRecentReviews: optionalNumber(sp.get("maxRecentReviews")),
      minTrending: optionalNumber(sp.get("minTrending")),
      maxTrending: optionalNumber(sp.get("maxTrending")),
      mode: (sp.get("mode") as AppsQueryParams["mode"]) || "all",
      favoritesOnly: sp.get("favoritesOnly") === "true",
      clientId: sp.get("clientId") || undefined,
    }

    const db = getDb()
    const result = await queryApps(db, params)
    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/apps", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch apps" },
      { status: 500 }
    )
  }
}
