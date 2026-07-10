"use client"

import Link from "next/link"
import {
  IconExternalLink,
  IconStarFilled,
  IconTrendingUp,
} from "@tabler/icons-react"
import type { ShopifyApp } from "@/lib/types"
import {
  formatKeyword,
  formatNumber,
  formatRating,
  formatTrendingScore,
  trendingTone,
} from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FavoriteButton } from "@/components/apps/favorite-button"

export function AppCard({ app }: { app: ShopifyApp }) {
  const keyword = formatKeyword(app.keyword)

  return (
    <Card className="group/card gap-0 py-0 transition-colors hover:ring-foreground/20">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <Link
              href={`/apps/${app.id}`}
              className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight transition-colors hover:text-primary"
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

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted/50 px-3 py-3">
            <p className="text-[11px] text-muted-foreground">Total reviews</p>
            <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
              {formatNumber(app.review_count)}
            </p>
          </div>
          <div className="rounded-md bg-muted/50 px-3 py-3">
            <p className="text-[11px] text-muted-foreground">Last 30 days</p>
            <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
              {formatNumber(app.recent_reviews_30_days)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <IconStarFilled className="size-3 text-amber-500" />
            <span className="font-medium tabular-nums text-foreground">
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
        </div>
      </div>
    </Card>
  )
}
