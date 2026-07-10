import { NextRequest, NextResponse } from "next/server"
import { queryApps } from "@/lib/apps-query"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId")
    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      )
    }

    const db = getDb()
    const result = await queryApps(db, {
      favoritesOnly: true,
      clientId,
      page: Number(request.nextUrl.searchParams.get("page") || 1),
      pageSize: Number(request.nextUrl.searchParams.get("pageSize") || 50),
      sort: "trending_score",
      order: "desc",
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/favorites", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch favorites",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const appId = Number(body.appId)
    const clientId = String(body.clientId || "")

    if (!appId || !clientId) {
      return NextResponse.json(
        { error: "appId and clientId are required" },
        { status: 400 }
      )
    }

    const db = getDb()
    await db.execute({
      sql: `
        INSERT INTO favorites (app_id, client_id, created_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(app_id) DO UPDATE SET
          client_id = excluded.client_id,
          created_at = datetime('now')
      `,
      args: [appId, clientId],
    })

    return NextResponse.json({ ok: true, favorited: true })
  } catch (error) {
    console.error("POST /api/favorites", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to add favorite",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const appId = Number(body.appId)
    const clientId = String(body.clientId || "")

    if (!appId || !clientId) {
      return NextResponse.json(
        { error: "appId and clientId are required" },
        { status: 400 }
      )
    }

    const db = getDb()
    await db.execute({
      sql: `DELETE FROM favorites WHERE app_id = ? AND (client_id = ? OR client_id = '')`,
      args: [appId, clientId],
    })

    return NextResponse.json({ ok: true, favorited: false })
  } catch (error) {
    console.error("DELETE /api/favorites", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to remove favorite",
      },
      { status: 500 }
    )
  }
}
