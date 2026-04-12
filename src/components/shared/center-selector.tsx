"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { MapPin } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CENTERS } from "@/config/centers"

export function CenterSelector() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentCenter = searchParams.get("center") || "all"

  function handleChange(value: string | null) {
    if (!value) return
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("center")
    } else {
      params.set("center", value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Select value={currentCenter} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px] h-9 text-sm">
        <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
        <SelectValue placeholder="Todos los centros" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los centros</SelectItem>
        {CENTERS.map((center) => (
          <SelectItem key={center.id} value={center.id}>
            {center.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
