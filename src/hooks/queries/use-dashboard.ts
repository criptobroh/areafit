"use client"

import { useQuery } from "@tanstack/react-query"

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json()
}

export type KPIs = {
  totalContacts: number
  totalMessages: number
  totalConversations: number
  totalRatings: number
  avgFitiScore: number
  avgResolvedScore: number
}

export function useKPIs() {
  return useQuery({
    queryKey: ["kpis"],
    queryFn: () => fetchJSON<KPIs>("/api/kpis"),
    refetchInterval: 60_000,
  })
}

export type ContactsByCenter = Array<{ center: string; count: number; isWhatsapp: boolean }>

export function useContactsByCenter() {
  return useQuery({
    queryKey: ["contacts-by-center"],
    queryFn: () => fetchJSON<ContactsByCenter>("/api/contacts-by-center"),
    refetchInterval: 60_000,
  })
}

export type UsageByCategory = Array<{ category: string; count: number }>

export function useUsageByCategory() {
  return useQuery({
    queryKey: ["usage-by-category"],
    queryFn: () => fetchJSON<UsageByCategory>("/api/usage-by-category"),
    refetchInterval: 60_000,
  })
}

export type TrendPoint = {
  date: string
  messages: number
  conversations: number
  ratings: number
}

export function useTrends(days = 30) {
  return useQuery({
    queryKey: ["trends", days],
    queryFn: () => fetchJSON<TrendPoint[]>(`/api/trends?days=${days}`),
    refetchInterval: 60_000,
  })
}

export type FitiLive = {
  total: number
  recent: Array<{
    id: number
    createdAt: string
    user: string | null
    source: string | null
    userText: string | null
    botReply: string | null
  }>
}

export function useFitiLive() {
  return useQuery({
    queryKey: ["fiti-live"],
    queryFn: () => fetchJSON<FitiLive>("/api/fiti-live"),
    refetchInterval: 15_000, // More frequent for live data
  })
}
