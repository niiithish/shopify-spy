"use client"

import {
  IconApps,
  IconFlame,
  IconTags,
  IconHeart,
} from "@tabler/icons-react"
import type { DashboardStats } from "@/lib/types"
import { formatNumber } from "@/lib/format"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const items = [
  {
    key: "total_apps" as const,
    label: "Apps",
    icon: IconApps,
    format: (s: DashboardStats) => formatNumber(s.total_apps),
  },
  {
    key: "unique_keywords" as const,
    label: "Keywords",
    icon: IconTags,
    format: (s: DashboardStats) => formatNumber(s.unique_keywords),
  },
  {
    key: "high_trending" as const,
    label: "Hot",
    icon: IconFlame,
    format: (s: DashboardStats) => formatNumber(s.high_trending),
  },
  {
    key: "favorites_count" as const,
    label: "Favorites",
    icon: IconHeart,
    format: (s: DashboardStats) => formatNumber(s.favorites_count),
  },
]

export function StatCards({
  stats,
  isLoading,
}: {
  stats?: DashboardStats
  isLoading?: boolean
}) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-0 py-0">
            <div className="space-y-2.5 p-5">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-7 w-12" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.key} className="gap-0 py-0">
            <div className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate">{item.label}</span>
                <Icon className="size-3.5 shrink-0 opacity-50" />
              </div>
              <div className="text-2xl font-semibold tracking-tight tabular-nums">
                {item.format(stats)}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
