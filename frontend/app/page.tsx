"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  IconArrowRight,
  IconFlame,
  IconRocket,
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
import { Badge } from "@/components/ui/badge"
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
        <h2 className="font-heading text-base font-semibold tracking-tight">
          {title}
        </h2>
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
        <SectionHeader
          icon={<IconFlame className="size-5 text-orange-500" />}
          title="Trending"
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
        <SectionHeader
          icon={<IconRocket className="size-5 text-violet-500" />}
          title="Opportunities"
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
          title="Keywords"
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
                    <CardDescription className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {formatNumber(kw.app_count)} apps
                      </Badge>
                      <span>trend {formatScore(kw.max_trending)}</span>
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
