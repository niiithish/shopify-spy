"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  IconArrowRight,
  IconFlame,
  IconRocket,
  IconTargetArrow,
  IconTags,
} from "@tabler/icons-react"
import { fetchApps, fetchKeywords, fetchStats } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { useClientId } from "@/hooks/use-client-id"
import { PageHeader } from "@/components/page-header"
import { StatCards } from "@/components/stats/stat-cards"
import { AppGrid } from "@/components/apps/app-grid"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatKeyword, formatNumber, formatScore } from "@/lib/format"
import { cn } from "@/lib/utils"

function SectionHeader({
  icon,
  title,
  href,
  linkLabel = "View all",
}: {
  icon: React.ReactNode
  title: string
  href: string
  linkLabel?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        {icon}
        <h2 className="font-heading text-base font-semibold">{title}</h2>
      </div>
      <Link
        href={href}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        {linkLabel}
        <IconArrowRight data-icon="inline-end" />
      </Link>
    </div>
  )
}

function DashboardSectionHeader({
  icon,
  title,
  description,
  href,
  linkLabel = "View all",
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  linkLabel?: string
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="min-w-0 space-y-1">
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Link
        href={href}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        {linkLabel}
        <IconArrowRight data-icon="inline-end" />
      </Link>
    </div>
  )
}

export default function DashboardPage() {
  const clientId = useClientId()

  const statsQuery = useQuery({
    queryKey: queryKeys.stats(clientId),
    queryFn: () => fetchStats(clientId || undefined),
    enabled: true,
  })

  const trendingQuery = useQuery({
    queryKey: queryKeys.apps({
      mode: "trending",
      sort: "trending_score",
      order: "desc",
      pageSize: 6,
      clientId: clientId || undefined,
    }),
    queryFn: () =>
      fetchApps({
        mode: "trending",
        sort: "trending_score",
        order: "desc",
        pageSize: 6,
        clientId: clientId || undefined,
      }),
  })

  const opportunitiesQuery = useQuery({
    queryKey: queryKeys.apps({
      mode: "opportunities",
      sort: "recent_reviews_30_days",
      order: "desc",
      pageSize: 6,
      clientId: clientId || undefined,
    }),
    queryFn: () =>
      fetchApps({
        mode: "opportunities",
        sort: "recent_reviews_30_days",
        order: "desc",
        pageSize: 6,
        clientId: clientId || undefined,
      }),
  })

  const improveTargetsQuery = useQuery({
    queryKey: queryKeys.apps({
      mode: "improve_targets",
      sort: "recent_reviews_30_days",
      order: "desc",
      pageSize: 6,
      clientId: clientId || undefined,
    }),
    queryFn: () =>
      fetchApps({
        mode: "improve_targets",
        sort: "recent_reviews_30_days",
        order: "desc",
        pageSize: 6,
        clientId: clientId || undefined,
      }),
  })

  const keywordsQuery = useQuery({
    queryKey: queryKeys.keywords(),
    queryFn: () => fetchKeywords(),
  })

  const topKeywords = keywordsQuery.data?.keywords.slice(0, 6) ?? []

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Find apps with traction, fresh demand, or a weak customer experience you can improve."
          actions={
            <Link href="/opportunities" className={cn(buttonVariants())}>
              <IconRocket data-icon="inline-start" />
              Opportunities
            </Link>
          }
        />
        <StatCards stats={statsQuery.data} isLoading={statsQuery.isLoading} />
      </div>

      <section className="space-y-6">
        <DashboardSectionHeader
          icon={<IconFlame className="size-5 text-orange-500" />}
          title="High traction apps"
          description="Apps with strong trend scores and recent review activity worth studying for demand patterns."
          href="/trending"
        />
        <AppGrid
          apps={trendingQuery.data?.apps}
          isLoading={trendingQuery.isLoading}
          emptyTitle="No trending apps"
          emptyMessage="Data will show once apps are scraped."
        />
      </section>

      <section className="space-y-6">
        <DashboardSectionHeader
          icon={<IconTargetArrow className="size-5 text-sky-500" />}
          title="Improve targets"
          description="Lower-rated apps that still get recent reviews, which can mean demand is alive but users are underserved."
          href="/opportunities"
          linkLabel="Explore"
        />
        <AppGrid
          apps={improveTargetsQuery.data?.apps}
          isLoading={improveTargetsQuery.isLoading}
          emptyTitle="No improve targets"
          emptyMessage="Try the Improve targets quick filter in app search."
        />
      </section>

      <section className="space-y-6">
        <DashboardSectionHeader
          icon={<IconRocket className="size-5 text-emerald-500" />}
          title="Early pull"
          description="Smaller apps with good ratings and fresh reviews, useful for finding niches before they look obvious."
          href="/opportunities"
        />
        <AppGrid
          apps={opportunitiesQuery.data?.apps}
          isLoading={opportunitiesQuery.isLoading}
          emptyTitle="No opportunities"
          emptyMessage="No early-stage apps match right now."
        />
      </section>

      <section className="space-y-6">
        <SectionHeader
          icon={<IconTags className="size-5 text-sky-500" />}
          title="Keyword markets"
          href="/keywords"
        />

        {keywordsQuery.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} size="sm">
                <CardHeader>
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : topKeywords.length === 0 ? (
          <AppGrid
            emptyTitle="No keywords"
            emptyMessage="Keywords will appear after scraping."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {topKeywords.map((kw) => (
              <Link
                key={kw.keyword}
                href={`/apps?keyword=${encodeURIComponent(kw.keyword)}`}
                className="group"
              >
                <Card
                  size="sm"
                  className="h-full transition-colors group-hover:ring-foreground/20"
                >
                  <CardHeader>
                    <CardTitle className="transition-colors group-hover:text-primary">
                      {formatKeyword(kw.keyword).label}
                    </CardTitle>
                    <CardDescription className="grid grid-cols-3 gap-2 pt-2 text-xs">
                      <span>
                        <span className="block text-muted-foreground">
                          Apps
                        </span>
                        <span className="font-medium text-foreground tabular-nums">
                          {formatNumber(kw.app_count)}
                        </span>
                      </span>
                      <span>
                        <span className="block text-muted-foreground">
                          Trend
                        </span>
                        <span className="font-medium text-foreground tabular-nums">
                          {formatScore(kw.max_trending)}
                        </span>
                      </span>
                      <span>
                        <span className="block text-muted-foreground">
                          30d reviews
                        </span>
                        <span className="font-medium text-foreground tabular-nums">
                          {formatNumber(kw.total_recent_reviews)}
                        </span>
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
