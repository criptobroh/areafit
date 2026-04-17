"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type Profile = {
  email: string
  firstName: string | null
  lastName: string | null
  nickname: string | null
  avatarUrl: string | null
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile> => {
      const res = await fetch("/api/profile")
      if (!res.ok) throw new Error("Failed to load profile")
      return res.json()
    },
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update profile")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] })
      qc.invalidateQueries({ queryKey: ["session"] })
    },
  })
}
