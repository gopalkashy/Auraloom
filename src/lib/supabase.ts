import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-product.jpg'
  if (path.startsWith('http')) return path
  return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`
}
