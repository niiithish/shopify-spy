"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { IconX } from "@tabler/icons-react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatKeyword } from "@/lib/format"

function AppsPageContent({ keywordFromUrl }: { keywordFromUrl: string }) {
  const clientId = useClientId()

  const [page, setPage] = useState(1)
  const [toolbar, setToolbar] = useState<AppsToolbarState>({
    ...defaultAppsToolbarState,
  })
  // null = use URL keyword; "" = user cleared the filter
  const [keywordOverride, setKeywordOverride] = useState<string | null>(null)
  const keyword = keywordOverride ?? keywordFromUrl

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
      keyword: keyword || undefined,
      clientId: clientId || undefined,
      ...filters,
    }
  }, [page, debouncedSearch, debouncedToolbar, keyword, toolbar, clientId])

  const appsQuery = useQuery({
    queryKey: queryKeys.apps(params),
    queryFn: () => fetchApps(params),
  })

  function updateToolbar(next: Partial<AppsToolbarState>) {
    setPage(1)
    setToolbar((prev) => ({ ...prev, ...next }))
  }

  return (
    <div className="space-y-8">
      <PageHeader title="All apps" />

      <AppsToolbar value={toolbar} onChange={updateToolbar} />

      {keyword ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtering by</span>
          <Badge variant="secondary">{formatKeyword(keyword).label}</Badge>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setKeywordOverride("")
              setPage(1)
            }}
          >
            <IconX data-icon="inline-start" />
            Clear
          </Button>
        </div>
      ) : null}

      <AppGrid
        apps={appsQuery.data?.apps}
        isLoading={appsQuery.isLoading || appsQuery.isFetching}
        emptyTitle="No apps found"
        emptyMessage="Try adjusting filters or clearing the keyword."
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

function AppsPageWithParams() {
  const searchParams = useSearchParams()
  const keywordFromUrl = searchParams.get("keyword") || ""

  return (
    <AppsPageContent key={keywordFromUrl} keywordFromUrl={keywordFromUrl} />
  )
}

export default function AppsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <PageHeader title="All apps" />
          <AppGrid isLoading />
        </div>
      }
    >
      <AppsPageWithParams />
    </Suspense>
  )
}
