"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function KPICard({
  title,
  value,
  trend,
  icon: Icon,
  format = "number",
}: {
  title: string
  value: number
  trend?: number
  icon: LucideIcon
  format?: "number" | "decimal"
}) {
  const isPositive = trend && trend > 0

  return (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-areafit-teal to-areafit-teal/40" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              {format === "decimal" ? (
                <span className="font-mono text-3xl font-bold tracking-tight">
                  {value.toFixed(2)}
                </span>
              ) : (
                <AnimatedCounter
                  value={value}
                  className="font-mono text-3xl font-bold tracking-tight"
                />
              )}
            </div>
            {trend !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-500 dark:text-red-400"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {trend.toFixed(1)}% vs mes anterior
                </span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-areafit-teal/10 p-2.5">
            <Icon className="h-5 w-5 text-areafit-teal" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
