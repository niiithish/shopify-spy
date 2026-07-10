"use client"

import Link from "next/link"
import {
  IconExternalLink,
  IconMessageCircle,
  IconSparkles,
  IconStarFilled,
  IconTargetArrow,
  IconTrendingUp,
} from "@tabler/icons-react"
import type { ShopifyApp } from "@/lib/types"
import {
  formatKeyword,
  formatNumber,
  formatPercent,
  formatRating,
  formatTrendingScore,
  opportunitySignal,
  reviewVelocityPercent,
  trendingTone,
} from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FavoriteButton } from "@/components/apps/favorite-button"

export function AppCard({ app }: { app: ShopifyApp }) {
  const keyword = formatKeyword(app.keyword)
  const velocity = reviewVelocityPercent(
    app.recent_reviews_30_days,
    app.review_count
  )
  const signal = opportunitySignal({
    rating: app.rating,
    reviewCount: app.review_count,
    recentReviews: app.recent_reviews_30_days,
    trendingScore: app.trending_score,
  })

  return (
    <Card className="group/card h-full gap-0 py-0 transition-colors hover:ring-foreground/20">
      <div className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <Link
              href={`/apps/${app.id}`}
              className="line-clamp-2 text-sm leading-snug font-semibold transition-colors hover:text-primary"
            >
              {app.title}
            </Link>
            {keyword.label !== "—" ? (
              <p className="truncate text-xs text-muted-foreground">
                {keyword.label}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {app.url ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100"
                      nativeButton={false}
                      render={
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open on Shopify"
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                    />
                  }
                >
                  <IconExternalLink />
                </TooltipTrigger>
                <TooltipContent>Open on Shopify</TooltipContent>
              </Tooltip>
            ) : null}
            <FavoriteButton
              appId={app.id}
              isFavorite={app.is_favorite}
              size="icon-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn("h-6", signalToneClass(signal.tone))}
          >
            {signal.tone === "improve" ? (
              <IconTargetArrow data-icon="inline-start" />
            ) : (
              <IconSparkles data-icon="inline-start" />
            )}
            {signal.label}
          </Badge>
          <span className="truncate text-xs text-muted-foreground">
            {signal.detail}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md border border-border/70 bg-muted/35 px-3 py-3">
            <p className="text-[11px] text-muted-foreground">Total</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {formatNumber(app.review_count)}
            </p>
          </div>
          <div className="rounded-md border border-border/70 bg-muted/35 px-3 py-3">
            <p className="text-[11px] text-muted-foreground">30d</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {formatNumber(app.recent_reviews_30_days)}
            </p>
          </div>
          <div className="rounded-md border border-border/70 bg-muted/35 px-3 py-3">
            <p className="text-[11px] text-muted-foreground">Ratio</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {formatPercent(velocity)}
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <IconStarFilled className="size-3 text-amber-500" />
            <span className="font-medium text-foreground tabular-nums">
              {formatRating(app.rating)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconTrendingUp className="size-3" />
            <span
              className={cn(
                "font-medium tabular-nums",
                trendingTone(app.trending_score)
              )}
            >
              {formatTrendingScore(app.trending_score)}
            </span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <IconMessageCircle className="size-3" />
            <span className="truncate">{app.price || "Unknown"}</span>
          </span>
        </div>
      </div>
    </Card>
  )
}

function signalToneClass(tone: ReturnType<typeof opportunitySignal>["tone"]) {
  if (tone === "strong") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
  if (tone === "improve") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
  }
  if (tone === "watch") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  }
  return "border-border bg-muted/40 text-muted-foreground"
}
