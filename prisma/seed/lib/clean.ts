/**
 * Data cleaning utilities for CSV imports
 */

import { parse } from "date-fns"

/**
 * Clean rating value: accept 1-5, scale 6-100 down, else null.
 * Returns { clean, raw } - raw preserves the original if it was out of range.
 */
export function cleanRating(value: unknown): { clean: number | null; raw: number | null } {
  if (value === null || value === undefined || value === "") {
    return { clean: null, raw: null }
  }
  const num = typeof value === "number" ? value : parseFloat(String(value))
  if (!Number.isFinite(num)) return { clean: null, raw: null }

  if (num >= 1 && num <= 5 && Number.isInteger(num)) {
    return { clean: num, raw: null }
  }
  if (num > 5 && num <= 100) {
    const scaled = Math.max(1, Math.min(5, Math.round(num / 20)))
    return { clean: scaled, raw: Math.round(num) }
  }
  return { clean: null, raw: Math.round(num) }
}

/**
 * Parse dates like "Jan 28, 2025 4:39 am" or "Sep 17, 2024 1:34 pm"
 */
export function parseCsvDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  // Try "MMM d, yyyy h:mm a" format
  try {
    const parsed = parse(trimmed, "MMM d, yyyy h:mm a", new Date())
    if (!isNaN(parsed.getTime())) return parsed
  } catch {}

  // Try native parse as fallback
  const native = new Date(trimmed)
  if (!isNaN(native.getTime())) return native

  return null
}

/**
 * Normalize email: lowercase + trim. Returns null if empty/invalid.
 */
export function normalizeEmail(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim().toLowerCase()
  if (!trimmed || !trimmed.includes("@")) return null
  return trimmed
}

/**
 * Trim string, return null if empty.
 */
export function trimOrNull(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed || null
}

/**
 * Slugify a string (for center slugs).
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
