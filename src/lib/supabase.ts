import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Returns the base site URL for auth redirects.
 * Uses VITE_SITE_URL if set (for production), otherwise falls back to window.location.origin.
 */
export function getSiteUrl(): string {
  // Allow explicit override via environment variable (e.g., https://auralooms.netlify.app)
  const configuredUrl = import.meta.env.VITE_SITE_URL as string | undefined
  if (configuredUrl) return configuredUrl.replace(/\/+$/, '')
  // Fall back to runtime origin
  if (typeof window !== 'undefined') return window.location.origin
  return 'http://localhost:5173'
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-product.jpg'
  if (path.startsWith('http')) return path
  return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`
}
