export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—"
  const n = typeof value === "string" ? Number(value) : value
  if (Number.isNaN(n)) return String(value)
  return new Intl.NumberFormat("en-US").format(n)
}

export function formatRating(value: string | number | null | undefined): string {
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
    /^_+/.test(raw) ||
    /_+$/.test(raw) ||
    Object.hasOwn(SOURCE_LABELS, cleaned)

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
