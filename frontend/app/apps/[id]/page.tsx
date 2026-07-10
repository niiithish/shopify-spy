"use client"

import Link from "next/link"
import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  IconExternalLink,
  IconMessageCircle,
  IconStarFilled,
  IconTrendingUp,
  IconCalendar,
  IconTag,
} from "@tabler/icons-react"
import { fetchApp, fetchApps } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { useClientId } from "@/hooks/use-client-id"
import {
  formatKeyword,
  formatNumber,
  formatRating,
  formatScore,
  formatTrendingScore,
  parseAppHandle,
  trendingTone,
} from "@/lib/format"
import { FavoriteButton } from "@/components/apps/favorite-button"
import { AppGrid } from "@/components/apps/app-grid"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default function AppDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = use(params)
  const id = Number(idParam)
  const clientId = useClientId()

  const appQuery = useQuery({
    queryKey: queryKeys.app(id, clientId || undefined),
    queryFn: () => fetchApp(id, clientId || undefined),
    enabled: Number.isFinite(id) && id > 0,
  })

  const relatedQuery = useQuery({
    queryKey: queryKeys.apps({
      keyword: appQuery.data?.keyword,
      pageSize: 4,
      sort: "trending_score",
      order: "desc",
      clientId: clientId || undefined,
    }),
    queryFn: () =>
      fetchApps({
        keyword: appQuery.data?.keyword,
        pageSize: 8,
        sort: "trending_score",
        order: "desc",
        clientId: clientId || undefined,
      }),
    enabled: Boolean(appQuery.data?.keyword),
  })

  if (appQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-10 w-2/3" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} size="sm">
              <CardHeader>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (appQuery.isError || !appQuery.data) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/apps" />}>
                Apps
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Not found</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Empty className="min-h-40 border border-dashed">
          <EmptyHeader>
            <EmptyTitle>App not found</EmptyTitle>
            <EmptyDescription>
              {appQuery.error?.message || "This app does not exist."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const app = appQuery.data
  const handle = parseAppHandle(app.url)
  const keyword = formatKeyword(app.keyword)
  const related =
    relatedQuery.data?.apps.filter((a) => a.id !== app.id).slice(0, 4) ?? []

  return (
    <div className="space-y-10">
      <div className="space-y-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/apps" />}>
                Apps
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[16rem] truncate">
                {app.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">
              {app.title}
            </h1>
            {handle ? (
              <p className="font-mono text-sm text-muted-foreground">{handle}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{app.price || "Unknown"}</Badge>
              <Badge variant="outline">
                <IconTag data-icon="inline-start" />
                {keyword.kind === "source" ? "Source" : "Keyword"} ·{" "}
                {keyword.label}
              </Badge>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <FavoriteButton
              appId={app.id}
              isFavorite={app.is_favorite}
              size="sm"
            />
            {app.url ? (
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants())}
              >
                Open on Shopify
                <IconExternalLink data-icon="inline-end" />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Trending score"
          value={formatTrendingScore(app.trending_score)}
          icon={<IconTrendingUp className="size-4" />}
          valueClassName={trendingTone(app.trending_score)}
          hint="0–100 · recent review momentum"
        />
        <MetricCard
          label="Rating"
          value={formatRating(app.rating)}
          icon={<IconStarFilled className="size-4 text-amber-500" />}
          hint={`${formatNumber(app.review_count)} total reviews`}
        />
        <MetricCard
          label="Reviews (30d)"
          value={formatNumber(app.recent_reviews_30_days)}
          icon={<IconMessageCircle className="size-4" />}
          hint="Velocity signal for demand"
        />
        <MetricCard
          label="Relevance"
          value={formatScore(app.relevance_score)}
          icon={<IconTag className="size-4" />}
          hint="Match quality for this keyword"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Replication notes</CardTitle>
            <CardDescription>
              Context to evaluate whether this niche is worth entering.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This app was found via{" "}
              <Link
                href={`/apps?keyword=${encodeURIComponent(app.keyword)}`}
                className="font-medium text-foreground hover:text-primary"
              >
                {keyword.label}
              </Link>
              {keyword.kind === "source"
                ? " (catalog source)"
                : " keyword"}
              . Compare competitors in the same niche below — look for gaps in
              UX, pricing, integrations, or support.
            </p>
            <Separator />
            <ul className="space-y-2">
              <li className="flex justify-between gap-4">
                <span>Price positioning</span>
                <span className="font-medium text-foreground">
                  {app.price || "unknown"}
                </span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Review base</span>
                <span className="font-medium text-foreground tabular-nums">
                  {formatNumber(app.review_count)} total ·{" "}
                  {formatNumber(app.recent_reviews_30_days)} / 30d
                </span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Momentum score</span>
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    trendingTone(app.trending_score)
                  )}
                >
                  {formatTrendingScore(app.trending_score)}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <MetaRow
              icon={<IconCalendar className="size-4" />}
              label="First seen"
              value={app.created_at || "—"}
            />
            <MetaRow
              icon={<IconCalendar className="size-4" />}
              label="Last updated"
              value={app.updated_at || "—"}
            />
            <MetaRow
              icon={<IconTag className="size-4" />}
              label="App ID"
              value={String(app.id)}
            />
          </CardContent>
        </Card>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-base font-semibold tracking-tight">
            Same keyword competitors
          </h2>
          <Link
            href={`/apps?keyword=${encodeURIComponent(app.keyword)}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            View niche
          </Link>
        </div>
        <AppGrid
          apps={related}
          isLoading={relatedQuery.isLoading}
          emptyTitle="No related apps"
          emptyMessage="No related apps found for this keyword."
        />
      </section>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
  hint,
  valueClassName,
}: {
  label: string
  value: string
  icon: React.ReactNode
  hint?: string
  valueClassName?: string
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription className="flex items-center justify-between gap-2">
          <span>{label}</span>
          {icon}
        </CardDescription>
        <CardTitle
          className={cn(
            "text-2xl font-semibold tabular-nums",
            valueClassName
          )}
        >
          {value}
        </CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  )
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-right font-mono text-xs">{value}</span>
    </div>
  )
}
