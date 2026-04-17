"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { type LucideIcon } from "lucide-react"

export function KPICard({
  title,
  value,
  icon: Icon,
  format = "number",
  loading = false,
}: {
  title: string
  value: number
  icon: LucideIcon
  format?: "number" | "decimal"
  loading?: boolean
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00AEEF] to-[#00AEEF]/40" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              {loading ? (
                <Skeleton className="h-9 w-24" />
              ) : format === "decimal" ? (
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
          </div>
          <div className="rounded-lg bg-[#00AEEF]/10 p-2.5">
            <Icon className="h-5 w-5 text-[#00AEEF]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
