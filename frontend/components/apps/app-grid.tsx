"use client"

import { IconSearch } from "@tabler/icons-react"
import type { ShopifyApp } from "@/lib/types"
import { AppCard } from "@/components/apps/app-card"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

export function AppGrid({
  apps,
  isLoading,
  emptyMessage = "No apps found.",
  emptyTitle = "No apps found",
}: {
  apps?: ShopifyApp[]
  isLoading?: boolean
  emptyMessage?: React.ReactNode
  emptyTitle?: string
}) {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="gap-0 py-0">
            <div className="space-y-4 p-5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 rounded-md" />
                <Skeleton className="h-16 rounded-md" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!apps?.length) {
    return (
      <Empty className="min-h-40 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconSearch />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  )
}
