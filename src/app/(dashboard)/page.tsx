"use client"

import { Topbar } from "@/components/layout/topbar"
import { KPICard } from "@/components/dashboard/kpi-card"
import { ContactsByCenterChart } from "@/components/dashboard/contacts-by-center-chart"
import { UsageByCategoryChart } from "@/components/dashboard/usage-by-category-chart"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { TopicsSummary } from "@/components/dashboard/topics-summary"
import { mockKPIs } from "@/lib/mock-data"
import { MessageSquareText, Users, Star, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <KPICard
            title="Conversaciones"
            value={mockKPIs.totalConversations}
            trend={mockKPIs.conversationsTrend}
            icon={MessageSquareText}
          />
          <KPICard
            title="Contactos"
            value={mockKPIs.totalContacts}
            trend={mockKPIs.contactsTrend}
            icon={Users}
          />
          <KPICard
            title="Valoraciones"
            value={mockKPIs.totalRatings}
            trend={mockKPIs.ratingsTrend}
            icon={Star}
          />
          <KPICard
            title="Puntuacion Fiti"
            value={mockKPIs.avgFitiScore}
            icon={TrendingUp}
            format="decimal"
          />
        </div>

        {/* Trend Chart - full width */}
        <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <TrendChart />
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

        {/* Topics Summary */}
        <div className="animate-fade-in-up" style={{ animationDelay: "550ms" }}>
          <TopicsSummary />
        </div>
      </div>
    </>
  )
}
