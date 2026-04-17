"use client"

import { Topbar } from "@/components/layout/topbar"
import { KPICard } from "@/components/dashboard/kpi-card"
import { ContactsByCenterChart } from "@/components/dashboard/contacts-by-center-chart"
import { UsageByCategoryChart } from "@/components/dashboard/usage-by-category-chart"
import { FitiLiveWidget } from "@/components/dashboard/fiti-live-widget"
import { useKPIs } from "@/hooks/queries/use-dashboard"
import { MessageSquareText, Users, Star, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { data, isLoading } = useKPIs()

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <KPICard
            title="Conversaciones"
            value={data?.totalConversations ?? 0}
            icon={MessageSquareText}
            loading={isLoading}
          />
          <KPICard
            title="Contactos"
            value={data?.totalContacts ?? 0}
            icon={Users}
            loading={isLoading}
          />
          <KPICard
            title="Valoraciones"
            value={data?.totalRatings ?? 0}
            icon={Star}
            loading={isLoading}
          />
          <KPICard
            title="Puntuacion Fiti"
            value={data?.avgFitiScore ?? 0}
            icon={TrendingUp}
            format="decimal"
            loading={isLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <ContactsByCenterChart />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "475ms" }}>
            <UsageByCategoryChart />
          </div>
        </div>

        {/* Fiti Live Widget - full width */}
        <div className="animate-fade-in-up" style={{ animationDelay: "550ms" }}>
          <FitiLiveWidget />
        </div>
      </div>
    </>
  )
}
