"use client"

import { IconHeart, IconHeartFilled } from "@tabler/icons-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleFavorite } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useClientId } from "@/hooks/use-client-id"

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
    mutationFn: async () => {
      if (!clientId) throw new Error("Client not ready")
      return toggleFavorite(appId, clientId, Boolean(isFavorite))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] })
      queryClient.invalidateQueries({ queryKey: ["app", appId] })
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
      queryClient.invalidateQueries({ queryKey: ["stats"] })
    },
  })

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn(
        "text-muted-foreground hover:text-rose-500",
        isFavorite && "text-rose-500 hover:text-rose-600",
        className
      )}
      disabled={!clientId || mutation.isPending}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        mutation.mutate()
      }}
      aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
    >
      {isFavorite ? (
        <IconHeartFilled className="size-4" />
      ) : (
        <IconHeart className="size-4" />
      )}
    </Button>
  )
}
