"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { CenterSelector } from "@/components/shared/center-selector"

export function Topbar({ title }: { title?: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      {title && (
        <h1 className="font-heading text-lg font-semibold tracking-tight">
          {title}
        </h1>
      )}
      <div className="ml-auto flex items-center gap-3">
        <CenterSelector />
      </div>
    </header>
  )
}
