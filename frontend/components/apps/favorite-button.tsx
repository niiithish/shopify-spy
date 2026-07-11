"use client"

import { IconHeart, IconHeartFilled } from "@tabler/icons-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleFavorite } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useClientId } from "@/hooks/use-client-id"
import type { AppsResponse, DashboardStats, ShopifyApp } from "@/lib/types"

function patchAppFavorite(
  app: ShopifyApp,
  appId: number,
  isFavorite: boolean
): ShopifyApp {
  if (app.id !== appId) return app
  return { ...app, is_favorite: isFavorite }
}

function patchAppsResponse(
  data: AppsResponse | undefined,
  appId: number,
  isFavorite: boolean,
  /** When unfavoriting on the favorites list, drop the row */
  removeIfUnfavorited = false
): AppsResponse | undefined {
  if (!data) return data
  if (!isFavorite && removeIfUnfavorited) {
    const apps = data.apps.filter((app) => app.id !== appId)
    return {
      ...data,
      apps,
      total: Math.max(0, data.total - (data.apps.length - apps.length)),
    }
  }
  return {
    ...data,
    apps: data.apps.map((app) => patchAppFavorite(app, appId, isFavorite)),
  }
}

export function FavoriteButton({
  appId,
  isFavorite,
  className,
  size = "icon-sm",
}: {
  appId: number
  isFavorite?: boolean
  className?: string
  size?: "icon-sm" | "icon-xs" | "sm"
}) {
  const clientId = useClientId()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (nextFavorite: boolean) => {
      if (!clientId) throw new Error("Client not ready")
      // API takes current favorited state: true = DELETE, false = POST
      return toggleFavorite(appId, clientId, !nextFavorite)
    },
    onMutate: async (nextFavorite) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["apps"] }),
        queryClient.cancelQueries({ queryKey: ["app", appId] }),
        queryClient.cancelQueries({ queryKey: ["favorites"] }),
        queryClient.cancelQueries({ queryKey: ["stats"] }),
      ])

      const previousApps = queryClient.getQueriesData<AppsResponse>({
        queryKey: ["apps"],
      })
      const previousApp = queryClient.getQueriesData<ShopifyApp>({
        queryKey: ["app", appId],
      })
      const previousFavorites = queryClient.getQueriesData<AppsResponse>({
        queryKey: ["favorites"],
      })
      const previousStats = queryClient.getQueriesData<DashboardStats>({
        queryKey: ["stats"],
      })

      queryClient.setQueriesData<AppsResponse>({ queryKey: ["apps"] }, (data) =>
        patchAppsResponse(data, appId, nextFavorite)
      )

      queryClient.setQueriesData<ShopifyApp>(
        { queryKey: ["app", appId] },
        (data) => (data ? patchAppFavorite(data, appId, nextFavorite) : data)
      )

      queryClient.setQueriesData<AppsResponse>(
        { queryKey: ["favorites"] },
        (data) => patchAppsResponse(data, appId, nextFavorite, true)
      )

      queryClient.setQueriesData<DashboardStats>(
        { queryKey: ["stats"] },
        (data) => {
          if (!data) return data
          const delta = nextFavorite ? 1 : -1
          return {
            ...data,
            favorites_count: Math.max(0, (data.favorites_count ?? 0) + delta),
          }
        }
      )

      return {
        previousApps,
        previousApp,
        previousFavorites,
        previousStats,
      }
    },
    onError: (_err, _nextFavorite, context) => {
      context?.previousApps.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
      context?.previousApp.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
      context?.previousFavorites.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
      context?.previousStats.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: () => {
      // Background sync — pages should not treat isFetching as a full reload
      void queryClient.invalidateQueries({ queryKey: ["apps"] })
      void queryClient.invalidateQueries({ queryKey: ["app", appId] })
      void queryClient.invalidateQueries({ queryKey: ["favorites"] })
      void queryClient.invalidateQueries({ queryKey: ["stats"] })
    },
  })

  // Prefer in-flight target so the icon stays correct even after cache updates
  const showFavorite =
    mutation.isPending && mutation.variables !== undefined
      ? mutation.variables
      : Boolean(isFavorite)

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn(
        "text-muted-foreground hover:text-rose-500",
        showFavorite && "text-rose-500 hover:text-rose-600",
        className
      )}
      disabled={!clientId || mutation.isPending}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        mutation.mutate(!Boolean(isFavorite))
      }}
      aria-label={showFavorite ? "Remove favorite" : "Add favorite"}
    >
      {showFavorite ? (
        <IconHeartFilled className="size-4" />
      ) : (
        <IconHeart className="size-4" />
      )}
    </Button>
  )
}
