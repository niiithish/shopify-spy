"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { IconRocket, IconTargetArrow } from "@tabler/icons-react"
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
import { Button } from "@/components/ui/button"

type OpportunityMode = "opportunities" | "improve_targets"

export default function OpportunitiesPage() {
  const clientId = useClientId()
  const [page, setPage] = useState(1)
  const [mode, setMode] = useState<OpportunityMode>("opportunities")
  const [toolbar, setToolbar] = useState<AppsToolbarState>({
    ...defaultAppsToolbarState,
    sort: "recent_reviews_30_days",
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
      mode,
      clientId: clientId || undefined,
      ...filters,
    }
  }, [page, debouncedSearch, debouncedToolbar, toolbar, clientId, mode])

  const appsQuery = useQuery({
    queryKey: queryKeys.apps(params),
    queryFn: () => fetchApps(params),
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Opportunities"
        description="Switch between early products with clean traction and weaker apps that still have recent demand."
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={mode === "opportunities" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setPage(1)
            setMode("opportunities")
          }}
        >
          <IconRocket data-icon="inline-start" />
          Early pull
        </Button>
        <Button
          type="button"
          variant={mode === "improve_targets" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setPage(1)
            setMode("improve_targets")
          }}
        >
          <IconTargetArrow data-icon="inline-start" />
          Improve targets
        </Button>
      </div>

      <AppsToolbar
        value={toolbar}
        onChange={(next) => {
          setPage(1)
          setToolbar((prev) => ({ ...prev, ...next }))
        }}
        defaultSort="recent_reviews_30_days"
      />

      <AppGrid
        apps={appsQuery.data?.apps}
        isLoading={appsQuery.isLoading || appsQuery.isFetching}
        emptyTitle={
          mode === "improve_targets" ? "No improve targets" : "No opportunities"
        }
        emptyMessage="No apps match this opportunity lane and filter set."
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
