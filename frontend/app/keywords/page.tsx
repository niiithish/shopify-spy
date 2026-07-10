"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { IconSearch, IconTags } from "@tabler/icons-react"
import { fetchKeywords } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { PageHeader } from "@/components/page-header"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  formatKeyword,
  formatNumber,
  formatRating,
  formatScore,
} from "@/lib/format"

export default function KeywordsPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  const keywordsQuery = useQuery({
    queryKey: queryKeys.keywords(debouncedSearch || undefined),
    queryFn: () => fetchKeywords(debouncedSearch || undefined),
  })

  const keywords = useMemo(
    () => keywordsQuery.data?.keywords ?? [],
    [keywordsQuery.data?.keywords]
  )

  const summary = useMemo(() => {
    if (!keywords.length) return null
    return {
      total: keywords.length,
      apps: keywords.reduce((sum, k) => sum + k.app_count, 0),
    }
  }, [keywords])

  return (
    <div className="space-y-8">
      <PageHeader title="Keywords" />

      <InputGroup className="max-w-md">
        <InputGroupAddon>
          <IconSearch />
        </InputGroupAddon>
        <InputGroupInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter keywords…"
        />
      </InputGroup>

      {summary ? (
        <p className="text-sm text-muted-foreground">
          Showing {formatNumber(summary.total)} keywords ·{" "}
          {formatNumber(summary.apps)} app placements
        </p>
      ) : null}

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead className="text-right">Apps</TableHead>
              <TableHead className="text-right">Max trend</TableHead>
              <TableHead className="text-right">Avg rating</TableHead>
              <TableHead className="text-right">Recent reviews</TableHead>
              <TableHead className="text-right">Free / paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywordsQuery.isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : keywords.map((kw) => (
                  <TableRow key={kw.keyword}>
                    <TableCell>
                      <Link
                        href={`/apps?keyword=${encodeURIComponent(kw.keyword)}`}
                        className="inline-flex items-center gap-2 font-medium transition-colors hover:text-primary"
                      >
                        <IconTags className="size-3.5 text-muted-foreground" />
                        {formatKeyword(kw.keyword).label}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(kw.app_count)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="tabular-nums">
                        {formatScore(kw.max_trending)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRating(kw.avg_rating)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(kw.total_recent_reviews)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                      {formatNumber(kw.free_count)} /{" "}
                      {formatNumber(kw.paid_count)}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {!keywordsQuery.isLoading && keywords.length === 0 ? (
          <Empty className="border-0 py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconTags />
              </EmptyMedia>
              <EmptyTitle>No keywords found</EmptyTitle>
              <EmptyDescription>
                No keywords match your filter.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
      </Card>
    </div>
  )
}
