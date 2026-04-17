"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useContactsByCenter } from "@/hooks/queries/use-dashboard"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-foreground px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-background">{label}</p>
      <p className="text-background/80">
        {payload[0].value.toLocaleString("es-ES")} contactos
      </p>
    </div>
  )
}

export function ContactsByCenterChart() {
  const { data, isLoading } = useContactsByCenter()

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold">
          Contactos por Centro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          {isLoading ? (
            <div className="h-full flex flex-col gap-2 justify-center">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(data ?? []).slice(0, 10)}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="var(--border)"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => v.toLocaleString("es-ES")}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="center"
                  type="category"
                  width={90}
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent)", opacity: 0.5 }} />
                <Bar
                  dataKey="count"
                  fill="#00AEEF"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
