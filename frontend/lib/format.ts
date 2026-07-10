export function formatNumber(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined || value === "") return "—"
  const n = typeof value === "string" ? Number(value) : value
  if (Number.isNaN(n)) return String(value)
  return new Intl.NumberFormat("en-US").format(n)
}

export function toFiniteNumber(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined || value === "") return null
  const n = typeof value === "string" ? Number(value) : value
  return Number.isFinite(n) ? n : null
}

export function formatRating(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined || value === "") return "—"
  const n = typeof value === "string" ? Number(value) : value
  if (Number.isNaN(n)) return String(value)
  return n.toFixed(1)
}

export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return Math.round(value).toString()
}

/** Trending is a 0–100 score; clamp display so values like 900 don't show. */
export function formatTrendingScore(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return Math.round(Math.min(Math.max(value, 0), 100)).toString()
}

export function clampTrendingScore(
  value: number | null | undefined
): number | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null
  return Math.min(Math.max(value, 0), 100)
}

export function parseAppHandle(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const path = new URL(url).pathname
    const parts = path.split("/").filter(Boolean)
    return parts[parts.length - 1] || null
  } catch {
    return null
  }
}

export function trendingTone(score: number | null | undefined): string {
  const clamped = clampTrendingScore(score)
  if (clamped === null) return "text-muted-foreground"
  if (clamped >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (clamped >= 50) return "text-amber-600 dark:text-amber-400"
  return "text-muted-foreground"
}

export function reviewVelocityPercent(
  recentReviews: number | string | null | undefined,
  totalReviews: number | string | null | undefined
): number | null {
  const recent = toFiniteNumber(recentReviews)
  const total = toFiniteNumber(totalReviews)
  if (recent === null || total === null || total <= 0) return null
  return (recent / total) * 100
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  if (value >= 10) return `${Math.round(value)}%`
  return `${value.toFixed(1)}%`
}

export function opportunitySignal({
  rating,
  reviewCount,
  recentReviews,
  trendingScore,
}: {
  rating: number | string | null | undefined
  reviewCount: number | string | null | undefined
  recentReviews: number | string | null | undefined
  trendingScore: number | null | undefined
}): {
  label: string
  tone: "strong" | "improve" | "watch" | "quiet"
  detail: string
} {
  const parsedRating = toFiniteNumber(rating)
  const reviews = toFiniteNumber(reviewCount)
  const recent = toFiniteNumber(recentReviews)
  const velocity = reviewVelocityPercent(recentReviews, reviewCount)
  const trend = clampTrendingScore(trendingScore)

  if (
    parsedRating !== null &&
    parsedRating <= 4.1 &&
    recent !== null &&
    recent >= 2 &&
    velocity !== null &&
    velocity >= 5
  ) {
    return {
      label: "Improve target",
      tone: "improve",
      detail: `${formatPercent(velocity)} recent-review ratio`,
    }
  }

  if ((trend !== null && trend >= 70) || (recent !== null && recent >= 10)) {
    return {
      label: "High traction",
      tone: "strong",
      detail: `${formatNumber(recent)} reviews in 30d`,
    }
  }

  if (
    reviews !== null &&
    reviews <= 50 &&
    parsedRating !== null &&
    parsedRating >= 4 &&
    recent !== null &&
    recent > 0
  ) {
    return {
      label: "Early pull",
      tone: "watch",
      detail: "Small base with fresh demand",
    }
  }

  return {
    label: "Watch",
    tone: "quiet",
    detail:
      recent !== null
        ? `${formatNumber(recent)} reviews in 30d`
        : "No recent review signal",
  }
}

/** Known scraper/source tokens → human labels (never show raw __sitemap__). */
const SOURCE_LABELS: Record<string, string> = {
  sitemap: "App store crawl",
  "app store": "App store crawl",
  appstore: "App store crawl",
  catalog: "Catalog crawl",
  scrape: "Scrape source",
  scraper: "Scrape source",
  unknown: "Unknown source",
}

function titleCaseWords(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Format a keyword/source for UI.
 * - Normal niches: "photo gallery" → "Photo Gallery"
 * - Technical tokens like `__sitemap__` → kind "source", label "App store crawl"
 */
export function formatKeyword(keyword: string | null | undefined): {
  label: string
  kind: "keyword" | "source"
} {
  if (keyword === null || keyword === undefined || keyword.trim() === "") {
    return { label: "—", kind: "keyword" }
  }

  const raw = keyword.trim()
  const cleaned = raw
    .replace(/^_+|_+$/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

  // Underscore-wrapped or known scraper tokens are sources, not niches
  const looksLikeSource =
    /^_+/.test(raw) || /_+$/.test(raw) || Object.hasOwn(SOURCE_LABELS, cleaned)

  if (looksLikeSource) {
    return {
      label: SOURCE_LABELS[cleaned] ?? (titleCaseWords(cleaned) || "Source"),
      kind: "source",
    }
  }

  return {
    label: titleCaseWords(cleaned) || raw,
    kind: "keyword",
  }
}

/** Compact "Keyword · Photo Gallery" / "Source · App store crawl" line */
export function formatKeywordLine(keyword: string | null | undefined): string {
  const { label, kind } = formatKeyword(keyword)
  if (label === "—") return "—"
  return `${kind === "source" ? "Source" : "Keyword"} · ${label}`
}
