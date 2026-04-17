"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useUsageByCategory } from "@/hooks/queries/use-dashboard"

const COLORS = [
  "#00AEEF", "#6366F1", "#E85D4A", "#F4A940", "#DB2777",
  "#059669", "#3D7CB8", "#84CC16", "#7C3AED", "#F97316",
]

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-foreground px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-background">{payload[0].name}</p>
      <p className="text-background/80">
        {payload[0].value.toLocaleString("es-ES")} mensajes
      </p>
    </div>
  )
}

export function UsageByCategoryChart() {
  const { data, isLoading } = useUsageByCategory()

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold">
          Uso por Automatizacion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Skeleton className="h-48 w-48 rounded-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data ?? []}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="category"
                  strokeWidth={0}
                >
                  {(data ?? []).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", lineHeight: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
