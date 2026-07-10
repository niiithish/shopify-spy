"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchFavorites } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { useClientId } from "@/hooks/use-client-id"
import { PageHeader } from "@/components/page-header"
import { AppGrid } from "@/components/apps/app-grid"

export default function FavoritesPage() {
  const clientId = useClientId()

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites(clientId),
    queryFn: () => fetchFavorites(clientId),
    enabled: Boolean(clientId),
  })

  return (
    <div className="space-y-8">
      <PageHeader title="Favorites" />

      {!clientId || favoritesQuery.isLoading ? (
        <AppGrid isLoading />
      ) : (
        <AppGrid
          apps={favoritesQuery.data?.apps}
          emptyTitle="No favorites yet"
          emptyMessage="Heart apps from any list to save them here."
        />
      )}
    </div>
  )
}
