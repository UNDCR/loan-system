"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { LoanTrendPoint } from "@/lib/types"

export const description = "Loan trends over time"

const chartConfig = (isDark: boolean) => ({
  loans: {
    label: "Loans",
  },
  loan_count: {
    label: "Number of Loans",
    color: isDark ? '#ffffff' : "var(--chart-1)",
  },
  total_loan_value: {
    label: "Total Loan Value (K)",
    color: isDark ? 'rgba(255, 255, 255, 0.7)' : "var(--chart-2)",
  },
}) satisfies ChartConfig

export function ChartAreaInteractive({ data }: { data: LoanTrendPoint[] }) {
  const [timeRange, setTimeRange] = React.useState("12m")

  const chartColors = {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    gradientStart: 'rgba(255, 255, 255, 0.5)',
    gradientMiddle: 'rgba(255, 255, 255, 0.25)',
    gradientEnd: 'rgba(255, 255, 255, 0.1)'
  };

  const getFilteredData = React.useCallback(() => {
    const monthsToShow = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12
    return data.slice(-monthsToShow)
  }, [data, timeRange])

  const filteredData = getFilteredData()

  return (
    <Card className="pt-0 bg-stone-900 text-white">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Loan Trends</CardTitle>
          <CardDescription>Monthly loan volume and value over time</CardDescription>
          <CardDescription>
            Showing loan trends for the last {timeRange}
          </CardDescription>
        </div>
        <Select defaultValue="12m" onValueChange={setTimeRange}>
          <SelectTrigger className="w-auto gap-2 text-xs" aria-label="Select time range">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig(true)}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
          >
            <defs>
              <linearGradient
                id="loanCount"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
                gradientTransform="rotate(0 0 0 1)"
              >
                <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.7} />
                <stop offset="50%" stopColor={chartColors.primary} stopOpacity={0.35} />
                <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="loanValue"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
                gradientTransform="rotate(0 0 0 1)"
              >
                <stop offset="0%" stopColor={chartColors.secondary} stopOpacity={0.5} />
                <stop offset="50%" stopColor={chartColors.secondary} stopOpacity={0.25} />
                <stop offset="100%" stopColor={chartColors.secondary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              interval={0}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: 'short' });
              }}
              label={{
                value: filteredData.length ? new Date(filteredData[0]?.month).getFullYear().toString() : "",
                position: 'insideBottomRight',
                offset: -10,
                fontSize: 12
              }}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null

                return (
                  <div className="rounded-lg border bg-background p-4 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">
                      {new Date(label).toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[var(--chart-1)]" />
                          <span className="text-xs">Number of Loans</span>
                        </div>
                        <span className="text-sm font-medium">
                          {payload[0].value}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[var(--chart-2)]" />
                          <span className="text-xs">Total Value</span>
                        </div>
                        <span className="text-sm font-medium">
                          {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(payload[1].value as number)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            <Area
              dataKey="loan_count"
              type="natural"
              fill="url(#loanCount)"
              stroke={chartColors.primary}
              stackId="a"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fillOpacity={0.1}
              isAnimationActive={false}
              yAxisId="left"
            />
            <Area
              dataKey="total_loan_value"
              type="natural"
              fill="url(#loanValue)"
              stroke={chartColors.secondary}
              stackId="b"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fillOpacity={0.1}
              isAnimationActive={false}
              yAxisId="right"
            />
            <ChartLegend
              content={({ payload }) => (
                <div className="flex items-center justify-center gap-4">
                  {payload?.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center gap-2 text-xs">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span>{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
