import { NextRequest, NextResponse } from "next/server"
import { getAppById } from "@/lib/apps-query"
import { getDb } from "@/lib/db"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params
    const id = Number(idParam)
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid app id" }, { status: 400 })
    }

    const clientId = request.nextUrl.searchParams.get("clientId") || undefined
    const db = getDb()
    const app = await getAppById(db, id, clientId)

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 })
    }

    return NextResponse.json(app)
  } catch (error) {
    console.error("GET /api/apps/[id]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch app" },
      { status: 500 }
    )
  }
}
