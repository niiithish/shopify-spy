"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchApps } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { useClientId } from "@/hooks/use-client-id"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { PageHeader } from "@/components/page-header"
import { AppGrid } from "@/components/apps/app-grid"
import {
  AppsToolbar,
  defaultAppsToolbarState,
  toolbarToQueryFilters,
  type AppsToolbarState,
} from "@/components/apps/apps-toolbar"
import { Pagination } from "@/components/apps/pagination"

export default function TrendingPage() {
  const clientId = useClientId()
  const [page, setPage] = useState(1)
  const [toolbar, setToolbar] = useState<AppsToolbarState>({
    ...defaultAppsToolbarState,
    sort: "trending_score",
    order: "desc",
  })
  const debouncedSearch = useDebouncedValue(toolbar.search, 350)
  const debouncedToolbar = useDebouncedValue(
    {
      minReviews: toolbar.minReviews,
      maxReviews: toolbar.maxReviews,
      minRecentReviews: toolbar.minRecentReviews,
      maxRecentReviews: toolbar.maxRecentReviews,
      minRating: toolbar.minRating,
      maxRating: toolbar.maxRating,
      minTrending: toolbar.minTrending,
      maxTrending: toolbar.maxTrending,
    },
    350
  )

  const params = useMemo(() => {
    const filters = toolbarToQueryFilters({
      ...toolbar,
      search: debouncedSearch,
      ...debouncedToolbar,
    })
    return {
      page,
      pageSize: 24,
      mode: "trending" as const,
      clientId: clientId || undefined,
      ...filters,
    }
  }, [page, debouncedSearch, debouncedToolbar, toolbar, clientId])

  const appsQuery = useQuery({
    queryKey: queryKeys.apps(params),
    queryFn: () => fetchApps(params),
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Trending"
        description="Prioritize apps with strong momentum, recent review volume, and proven demand."
      />

      <AppsToolbar
        value={toolbar}
        onChange={(next) => {
          setPage(1)
          setToolbar((prev) => ({ ...prev, ...next }))
        }}
      />

      <AppGrid
        apps={appsQuery.data?.apps}
        isLoading={appsQuery.isLoading || appsQuery.isFetching}
        emptyTitle="No trending apps"
        emptyMessage="No trending apps match your filters."
      />

      {appsQuery.data ? (
        <Pagination
          page={appsQuery.data.page}
          totalPages={appsQuery.data.totalPages}
          total={appsQuery.data.total}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  )
}
