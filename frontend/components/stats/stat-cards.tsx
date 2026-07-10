"use client"

import {
  IconApps,
  IconFlame,
  IconRocket,
  IconTargetArrow,
} from "@tabler/icons-react"
import type { DashboardStats } from "@/lib/types"
import { formatNumber } from "@/lib/format"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const items = [
  {
    key: "total_apps" as const,
    label: "Tracked apps",
    hint: "Total app records",
    icon: IconApps,
    format: (s: DashboardStats) => formatNumber(s.total_apps),
  },
  {
    key: "high_trending" as const,
    label: "High traction",
    hint: "Trend score 70+",
    icon: IconFlame,
    format: (s: DashboardStats) => formatNumber(s.high_trending),
  },
  {
    key: "new_opportunities" as const,
    label: "Early pull",
    hint: "Small base, fresh reviews",
    icon: IconRocket,
    format: (s: DashboardStats) => formatNumber(s.new_opportunities),
  },
  {
    key: "improve_targets" as const,
    label: "Improve targets",
    hint: "Low rating, active demand",
    icon: IconTargetArrow,
    format: (s: DashboardStats) => formatNumber(s.improve_targets),
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
            <div className="flex min-h-28 flex-col gap-2 p-5">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate">{item.label}</span>
                <Icon className="size-3.5 shrink-0 opacity-50" />
              </div>
              <div className="text-2xl font-semibold tabular-nums">
                {item.format(stats)}
              </div>
              <p className="mt-auto text-xs text-muted-foreground">
                {item.hint}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
