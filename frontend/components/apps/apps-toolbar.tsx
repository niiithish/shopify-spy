"use client"

import { useState } from "react"
import {
  IconAdjustmentsHorizontal,
  IconChartBar,
  IconSearch,
  IconSparkles,
  IconTargetArrow,
  IconX,
} from "@tabler/icons-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import type { AppsQueryParams, SortField, SortOrder } from "@/lib/types"
import { formatNumber } from "@/lib/format"

/** Empty string = no filter; numeric strings for controlled inputs */
export type AppsToolbarState = {
  search: string
  price: string
  sort: SortField
  order: SortOrder
  minReviews: string
  maxReviews: string
  minRecentReviews: string
  maxRecentReviews: string
  minRating: string
  maxRating: string
  minTrending: string
  maxTrending: string
}

export const defaultAppsToolbarState: AppsToolbarState = {
  search: "",
  price: "all",
  sort: "trending_score",
  order: "desc",
  minReviews: "",
  maxReviews: "",
  minRecentReviews: "",
  maxRecentReviews: "",
  minRating: "",
  maxRating: "",
  minTrending: "",
  maxTrending: "",
}

export function parseOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export function toolbarToQueryFilters(
  toolbar: AppsToolbarState
): Pick<
  AppsQueryParams,
  | "minReviews"
  | "maxReviews"
  | "minRecentReviews"
  | "maxRecentReviews"
  | "minRating"
  | "maxRating"
  | "minTrending"
  | "maxTrending"
  | "price"
  | "sort"
  | "order"
  | "search"
> {
  return {
    search: toolbar.search.trim() || undefined,
    price: toolbar.price === "all" ? undefined : toolbar.price,
    sort: toolbar.sort,
    order: toolbar.order,
    minReviews: parseOptionalNumber(toolbar.minReviews),
    maxReviews: parseOptionalNumber(toolbar.maxReviews),
    minRecentReviews: parseOptionalNumber(toolbar.minRecentReviews),
    maxRecentReviews: parseOptionalNumber(toolbar.maxRecentReviews),
    minRating: parseOptionalNumber(toolbar.minRating),
    maxRating: parseOptionalNumber(toolbar.maxRating),
    minTrending: parseOptionalNumber(toolbar.minTrending),
    maxTrending: parseOptionalNumber(toolbar.maxTrending),
  }
}

export function countActiveAdvancedFilters(value: AppsToolbarState): number {
  return [
    value.minReviews,
    value.maxReviews,
    value.minRecentReviews,
    value.maxRecentReviews,
    value.minRating,
    value.maxRating,
    value.minTrending,
    value.maxTrending,
  ].filter((v) => v.trim() !== "").length
}

/** Base UI Select shows raw values unless `items` maps value → label. */
const PRICE_OPTIONS = [
  { value: "all", label: "All prices" },
  { value: "Free", label: "Free" },
  { value: "Free trial", label: "Free trial" },
  { value: "Paid", label: "Paid" },
] as const

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "trending_score", label: "Trending score" },
  { value: "recent_reviews_30_days", label: "Reviews (30d)" },
  { value: "rating", label: "Rating" },
  { value: "review_count", label: "Total reviews" },
  { value: "relevance_score", label: "Relevance" },
  { value: "created_at", label: "First seen" },
  { value: "title", label: "Name" },
]

const ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "desc", label: "Desc" },
  { value: "asc", label: "Asc" },
]

/** Slider bounds. Thumbs at either end = no filter on that side. */
const FILTER_RANGES = {
  reviews: { min: 0, max: 5000, step: 10 },
  recentReviews: { min: 0, max: 100, step: 1 },
  rating: { min: 0, max: 5, step: 0.1 },
  trending: { min: 0, max: 100, step: 1 },
} as const

function parseBound(value: string, fallback: number): number {
  if (value.trim() === "") return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function stepDecimals(step: number): number {
  return String(step).includes(".")
    ? (String(step).split(".")[1]?.length ?? 0)
    : 0
}

function formatStepValue(value: number, step: number): string {
  const decimals = stepDecimals(step)
  return decimals > 0
    ? Number(value.toFixed(decimals)).toFixed(decimals)
    : String(Math.round(value))
}

function atBound(value: number, edge: number): boolean {
  return Math.abs(value - edge) < 1e-9
}

function boundToFilterString(
  value: number,
  edge: number,
  step: number,
  isMinEdge: boolean
): string {
  // Slider values are already stepped; ends mean “no bound”
  if (isMinEdge ? value <= edge : value >= edge) return ""
  return formatStepValue(value, step)
}

function formatMinLabel(
  value: number,
  boundMin: number,
  style: "count" | "rating" | "score"
): string {
  if (atBound(value, boundMin) || value <= boundMin) return "Any"
  if (style === "rating") return value.toFixed(1)
  if (style === "score") return String(Math.round(value))
  return formatNumber(Math.round(value))
}

function formatMaxLabel(
  value: number,
  boundMax: number,
  style: "count" | "rating" | "score"
): string {
  if (atBound(value, boundMax) || value >= boundMax) {
    return style === "count" ? `${formatNumber(boundMax)}+` : "Any"
  }
  if (style === "rating") return value.toFixed(1)
  if (style === "score") return String(Math.round(value))
  return formatNumber(Math.round(value))
}

function RangeFilter({
  label,
  minValue,
  maxValue,
  boundMin,
  boundMax,
  step,
  style,
  onChange,
}: {
  label: string
  minValue: string
  maxValue: string
  boundMin: number
  boundMax: number
  step: number
  style: "count" | "rating" | "score"
  onChange: (min: string, max: string) => void
}) {
  const lo = Math.min(
    boundMax,
    Math.max(boundMin, parseBound(minValue, boundMin))
  )
  const hi = Math.min(
    boundMax,
    Math.max(boundMin, parseBound(maxValue, boundMax))
  )
  // Keep thumbs ordered if state is briefly inverted
  const range: [number, number] = lo <= hi ? [lo, hi] : [hi, lo]

  const loLabel = formatMinLabel(range[0], boundMin, style)
  const hiLabel = formatMaxLabel(range[1], boundMax, style)

  return (
    <div className="space-y-3 rounded-md border border-border/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xs tabular-nums text-foreground">
          {loLabel}
          <span className="mx-1 text-muted-foreground">–</span>
          {hiLabel}
        </p>
      </div>
      <Slider
        min={boundMin}
        max={boundMax}
        step={step}
        minStepsBetweenValues={1}
        value={range}
        onValueChange={(next) => {
          const [nextLo, nextHi] = next as number[]
          onChange(
            boundToFilterString(nextLo, boundMin, step, true),
            boundToFilterString(nextHi, boundMax, step, false)
          )
        }}
        className="w-full"
      />
      <div className="flex justify-between text-[0.65rem] tabular-nums text-muted-foreground">
        <span>
          {style === "rating" ? boundMin.toFixed(1) : formatNumber(boundMin)}
        </span>
        <span>
          {style === "rating"
            ? boundMax.toFixed(1)
            : style === "count"
              ? `${formatNumber(boundMax)}+`
              : formatNumber(boundMax)}
        </span>
      </div>
    </div>
  )
}

function QuickFilterButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1.5"
      onClick={onClick}
    >
      {icon}
      {label}
    </Button>
  )
}

export function AppsToolbar({
  value,
  onChange,
  showPrice = true,
  defaultSort,
}: {
  value: AppsToolbarState
  onChange: (next: Partial<AppsToolbarState>) => void
  showPrice?: boolean
  defaultSort?: SortField
}) {
  const activeCount = countActiveAdvancedFilters(value)
  const [open, setOpen] = useState(activeCount > 0)

  function clearAdvanced() {
    onChange({
      minReviews: "",
      maxReviews: "",
      minRecentReviews: "",
      maxRecentReviews: "",
      minRating: "",
      maxRating: "",
      minTrending: "",
      maxTrending: "",
    })
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <InputGroup className="min-w-0 flex-1">
          <InputGroupAddon>
            <IconSearch />
          </InputGroupAddon>
          <InputGroupInput
            value={value.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search apps, keywords, or URLs…"
          />
        </InputGroup>

        <div className="flex flex-wrap gap-2.5">
          {showPrice && (
            <Select
              value={value.price}
              onValueChange={(price) => onChange({ price: price ?? "all" })}
              items={PRICE_OPTIONS}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select
            value={value.sort}
            onValueChange={(sort) =>
              onChange({
                sort: (sort as SortField) || defaultSort || "trending_score",
              })
            }
            items={SORT_OPTIONS}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={value.order}
            onValueChange={(order) =>
              onChange({ order: (order as SortOrder) || "desc" })
            }
            items={ORDER_OPTIONS}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CollapsibleTrigger
            render={
              <Button type="button" variant="outline" className="gap-1.5" />
            }
          >
            <IconAdjustmentsHorizontal className="size-4" />
            Filters
            {activeCount > 0 ? (
              <Badge variant="secondary" className="ml-0.5 tabular-nums">
                {activeCount}
              </Badge>
            ) : null}
          </CollapsibleTrigger>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Quick filters
        </span>
        <QuickFilterButton
          icon={<IconSparkles className="size-4" />}
          label="Recent traction"
          onClick={() =>
            onChange({
              minRecentReviews: "1",
              sort: "recent_reviews_30_days",
              order: "desc",
            })
          }
        />
        <QuickFilterButton
          icon={<IconChartBar className="size-4" />}
          label="Proven demand"
          onClick={() =>
            onChange({
              minReviews: "100",
              sort: "review_count",
              order: "desc",
            })
          }
        />
        <QuickFilterButton
          icon={<IconTargetArrow className="size-4" />}
          label="Improve targets"
          onClick={() =>
            onChange({
              minReviews: "5",
              minRecentReviews: "2",
              maxRating: "4.1",
              sort: "recent_reviews_30_days",
              order: "desc",
            })
          }
        />
      </div>

      <CollapsibleContent>
        <div className="rounded-lg border bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Advanced filters</p>
            {activeCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={clearAdvanced}
              >
                <IconX data-icon="inline-start" />
                Clear filters
              </Button>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <RangeFilter
              label="Total reviews"
              minValue={value.minReviews}
              maxValue={value.maxReviews}
              boundMin={FILTER_RANGES.reviews.min}
              boundMax={FILTER_RANGES.reviews.max}
              step={FILTER_RANGES.reviews.step}
              style="count"
              onChange={(minReviews, maxReviews) =>
                onChange({ minReviews, maxReviews })
              }
            />
            <RangeFilter
              label="Reviews (30 days)"
              minValue={value.minRecentReviews}
              maxValue={value.maxRecentReviews}
              boundMin={FILTER_RANGES.recentReviews.min}
              boundMax={FILTER_RANGES.recentReviews.max}
              step={FILTER_RANGES.recentReviews.step}
              style="count"
              onChange={(minRecentReviews, maxRecentReviews) =>
                onChange({ minRecentReviews, maxRecentReviews })
              }
            />
            <RangeFilter
              label="Rating"
              minValue={value.minRating}
              maxValue={value.maxRating}
              boundMin={FILTER_RANGES.rating.min}
              boundMax={FILTER_RANGES.rating.max}
              step={FILTER_RANGES.rating.step}
              style="rating"
              onChange={(minRating, maxRating) =>
                onChange({ minRating, maxRating })
              }
            />
            <RangeFilter
              label="Trend score"
              minValue={value.minTrending}
              maxValue={value.maxTrending}
              boundMin={FILTER_RANGES.trending.min}
              boundMax={FILTER_RANGES.trending.max}
              step={FILTER_RANGES.trending.step}
              style="score"
              onChange={(minTrending, maxTrending) =>
                onChange({ minTrending, maxTrending })
              }
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
