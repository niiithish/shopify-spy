import type { AppsQueryParams } from "@/lib/types"

export const queryKeys = {
  stats: (clientId?: string) => ["stats", clientId ?? ""] as const,
  apps: (params: AppsQueryParams) => ["apps", params] as const,
  app: (id: number, clientId?: string) => ["app", id, clientId ?? ""] as const,
  keywords: (search?: string) => ["keywords", search ?? ""] as const,
  favorites: (clientId: string) => ["favorites", clientId] as const,
}
