import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Search, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/shop/ProductCard'
import { Layout } from '@/components/layout/Layout'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import { toast } from 'sonner'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const featuredOnly = searchParams.get('featured') === 'true'
  const [inputValue, setInputValue] = React.useState(query)
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (featuredOnly) {
      const load = async () => {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('*, subcategory:subcategories(*, category:categories(*))')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(50)
        if (error) toast.error('Failed to load products')
        setProducts(data ?? [])
        setLoading(false)
      }
      load()
      return
    }

    if (!query) {
      setProducts([])
      setLoading(false)
      return
    }

    const search = async () => {
      setLoading(true)

      // Generate search variations for fuzzy matching
      const words = query.toLowerCase().split(/\s+/).filter(Boolean)
      const variations = new Set<string>()

      words.forEach(word => {
        variations.add(word)
        // Add singular/plural variations
        if (word.endsWith('s')) variations.add(word.slice(0, -1))
        if (word.endsWith('es')) variations.add(word.slice(0, -2))
        if (!word.endsWith('s')) variations.add(word + 's')
        if (!word.endsWith('es') && word.endsWith('y')) variations.add(word.slice(0, -1) + 'ies')
        // Add common typo variations (missing last char, missing first char, swapped last two)
        if (word.length > 3) {
          variations.add(word.slice(0, -1))
          variations.add(word.slice(1))
          const swapped = word.slice(0, -2) + word.slice(-1) + word.slice(-2, -1)
          variations.add(swapped)
        }
      })

      // Build OR conditions for all variations
      const conditions = Array.from(variations).flatMap(v =>
        [`name.ilike.%${v}%`, `description.ilike.%${v}%`]
      )

      const { data } = await supabase
        .from('products')
        .select('*, subcategory:subcategories(*, category:categories(*))')
        .eq('is_active', true)
        .or(conditions.join(','))
        .order('created_at', { ascending: false })
        .limit(50)

      // Filter results by relevance - prioritize exact matches
      const queryLower = query.toLowerCase()
      const sorted = (data ?? []).sort((a, b) => {
        const aName = a.name.toLowerCase()
        const bName = b.name.toLowerCase()
        const aExact = aName.includes(queryLower)
        const bExact = bName.includes(queryLower)
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        return 0
      })

      setProducts(sorted)
      setLoading(false)
    }
    search()
  }, [query, featuredOnly])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() })
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Search</span>
        </nav>

        {/* Search form */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Search for products..."
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button type="submit" size="lg">Search</Button>
          </form>
        </div>

        {/* Results header */}
        {(query || featuredOnly) && (
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {loading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                <>
                  {featuredOnly
                    ? `${products.length} Featured Product${products.length !== 1 ? 's' : ''}`
                    : `${products.length} result${products.length !== 1 ? 's' : ''} for "${query}"`}
                </>
              )}
            </h1>
          </div>
        )}

        {/* Results */}
        {!query && !featuredOnly ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Search for products</h3>
            <p className="text-muted-foreground text-sm">Enter a keyword to find products</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm mb-4">Try different keywords or browse our categories</p>
            <Button variant="outline" asChild>
              <Link to="/">Browse Categories</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
