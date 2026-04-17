"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useTrends } from "@/hooks/queries/use-dashboard"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-foreground px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-background">
        {format(parseISO(label), "d MMM yyyy", { locale: es })}
      </p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-background/80">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name === "messages"
            ? "Mensajes"
            : entry.name === "conversations"
            ? "Conversaciones"
            : "Valoraciones"}
          : {entry.value.toLocaleString("es-ES")}
        </p>
      ))}
    </div>
  )
}

export function TrendChart() {
  const { data, isLoading } = useTrends(30)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold">
          Tendencia (ultimos 30 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data ?? []}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradMsg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00AEEF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00AEEF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(d) => format(parseISO(d), "d MMM", { locale: es })}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => v.toLocaleString("es-ES")}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#00AEEF"
                  strokeWidth={2}
                  fill="url(#gradMsg)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#00AEEF" }}
                />
                <Area
                  type="monotone"
                  dataKey="conversations"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="url(#gradConv)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#6366F1" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
