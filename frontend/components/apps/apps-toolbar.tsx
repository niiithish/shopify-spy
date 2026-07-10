"use client"

import { useState } from "react"
import {
  IconAdjustmentsHorizontal,
  IconSearch,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import type { AppsQueryParams, SortField, SortOrder } from "@/lib/types"

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

function FilterField({
  id,
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  min?: number
  max?: number
  step?: number | string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder ?? "Any"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8"
      />
    </div>
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
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All prices</SelectItem>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Free trial">Free trial</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select
            value={value.sort}
            onValueChange={(sort) =>
              onChange({
                sort:
                  (sort as SortField) ||
                  defaultSort ||
                  "trending_score",
              })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending_score">Trending score</SelectItem>
              <SelectItem value="recent_reviews_30_days">
                Reviews (30d)
              </SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="review_count">Total reviews</SelectItem>
              <SelectItem value="relevance_score">Relevance</SelectItem>
              <SelectItem value="created_at">First seen</SelectItem>
              <SelectItem value="title">Name</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={value.order}
            onValueChange={(order) =>
              onChange({ order: (order as SortOrder) || "desc" })
            }
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Desc</SelectItem>
              <SelectItem value="asc">Asc</SelectItem>
            </SelectContent>
          </Select>
          <CollapsibleTrigger
            render={<Button type="button" variant="outline" className="gap-1.5" />}
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
            <div className="space-y-3 rounded-md border border-border/60 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Total reviews
              </p>
              <div className="grid grid-cols-2 gap-2">
                <FilterField
                  id="min-reviews"
                  label="Min"
                  value={value.minReviews}
                  onChange={(minReviews) => onChange({ minReviews })}
                  min={0}
                  step={1}
                />
                <FilterField
                  id="max-reviews"
                  label="Max"
                  value={value.maxReviews}
                  onChange={(maxReviews) => onChange({ maxReviews })}
                  min={0}
                  step={1}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-md border border-border/60 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Reviews (30 days)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <FilterField
                  id="min-recent"
                  label="Min"
                  value={value.minRecentReviews}
                  onChange={(minRecentReviews) =>
                    onChange({ minRecentReviews })
                  }
                  min={0}
                  step={1}
                />
                <FilterField
                  id="max-recent"
                  label="Max"
                  value={value.maxRecentReviews}
                  onChange={(maxRecentReviews) =>
                    onChange({ maxRecentReviews })
                  }
                  min={0}
                  step={1}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-md border border-border/60 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Rating
              </p>
              <div className="grid grid-cols-2 gap-2">
                <FilterField
                  id="min-rating"
                  label="Min"
                  value={value.minRating}
                  onChange={(minRating) => onChange({ minRating })}
                  min={0}
                  max={5}
                  step={0.1}
                />
                <FilterField
                  id="max-rating"
                  label="Max"
                  value={value.maxRating}
                  onChange={(maxRating) => onChange({ maxRating })}
                  min={0}
                  max={5}
                  step={0.1}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-md border border-border/60 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Trend score (0–100)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <FilterField
                  id="min-trend"
                  label="Min"
                  value={value.minTrending}
                  onChange={(minTrending) => onChange({ minTrending })}
                  min={0}
                  max={100}
                  step={1}
                />
                <FilterField
                  id="max-trend"
                  label="Max"
                  value={value.maxTrending}
                  onChange={(maxTrending) => onChange({ maxTrending })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
