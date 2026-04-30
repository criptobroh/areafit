"use client"

import { useQuery, keepPreviousData } from "@tanstack/react-query"

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json()
}

function buildQuery(params: Record<string, string | number | null | undefined>) {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== "") {
      search.set(k, String(v))
    }
  }
  return search.toString()
}

// ── Conversations ────────────────────────────────────────

export type ConversationRow = {
  id: string
  contactEmail: string | null
  channel: string
  center: { name: string } | null
  messageCount: number
  firstMessageAt: string
  lastMessageAt: string
  lastUserText: string | null
  category: string | null
  status: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function useConversations(filters: {
  page?: number
  center?: string
  category?: string
  channel?: string
  search?: string
}) {
  const query = buildQuery(filters)
  return useQuery({
    queryKey: ["conversations", filters],
    queryFn: () => fetchJSON<PaginatedResponse<ConversationRow>>(`/api/conversations?${query}`),
    placeholderData: keepPreviousData,
  })
}

export type ConversationDetail = ConversationRow & {
  messages: Array<{
    id: string
    userText: string | null
    botReply: string | null
    createdAt: string
    category: string | null
  }>
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => fetchJSON<ConversationDetail>(`/api/conversations/${id}`),
    enabled: !!id,
  })
}

// ── Contacts ─────────────────────────────────────────────

export type ContactRow = {
  id: string
  manychatId: string | null
  email: string
  center: string
  channel: string
  messageCount: number
  avgFitiScore: number | null
  createdAt: string
}

export function useContacts(filters: { page?: number; center?: string; search?: string }) {
  const query = buildQuery(filters)
  return useQuery({
    queryKey: ["contacts", filters],
    queryFn: () => fetchJSON<PaginatedResponse<ContactRow>>(`/api/contacts?${query}`),
    placeholderData: keepPreviousData,
  })
}

// ── Ratings ──────────────────────────────────────────────

export type RatingRow = {
  id: string
  contactEmail: string
  center: string
  fitiScore: number | null
  resolvedScore: number | null
  comment: string | null
  modifiedAt: string
}

export function useRatings(filters: {
  page?: number
  center?: string
  minScore?: number
  hasComment?: boolean
}) {
  const query = buildQuery({
    ...filters,
    hasComment: filters.hasComment ? "true" : undefined,
  })
  return useQuery({
    queryKey: ["ratings", filters],
    queryFn: () => fetchJSON<PaginatedResponse<RatingRow>>(`/api/ratings?${query}`),
    placeholderData: keepPreviousData,
  })
}

export type RatingStats = {
  total: number
  historicalTotal: number
  liveTotal: number
  avgFitiScore: number
  avgResolvedScore: number
  distribution: Array<{ score: number | null; count: number }>
}

export function useRatingStats() {
  return useQuery({
    queryKey: ["ratings-stats"],
    queryFn: () => fetchJSON<RatingStats>("/api/ratings/stats"),
  })
}

// ── Live Reviews (Supabase via n8n) ──────────────────────

export type LiveReviewRow = {
  id: string
  contactUser: string | null
  fitiScore: number | null
  resolvedScore: number | null
  comment: string | null
  createdAt: string
}

export type LiveReviewsResponse = {
  total: number
  avgFitiScore: number
  avgResolvedScore: number
  withComment: number
  data: LiveReviewRow[]
}

export function useFitiReviews() {
  return useQuery({
    queryKey: ["fiti-reviews"],
    queryFn: () => fetchJSON<LiveReviewsResponse>("/api/fiti-reviews"),
    refetchInterval: 30_000, // poll cada 30s
  })
}
