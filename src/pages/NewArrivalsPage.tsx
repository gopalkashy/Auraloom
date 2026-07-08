import * as React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/shop/ProductCard'
import { Layout } from '@/components/layout/Layout'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

export function NewArrivalsPage() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sortParam, setSortParam] = React.useState('newest')

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      let query = supabase
        .from('products')
        .select('*, subcategory:subcategories(*, category:categories(*))')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(40)

      if (sortParam === 'price_asc') query = query.order('price', { ascending: true })
      else if (sortParam === 'price_desc') query = query.order('price', { ascending: false })

      const { data: prods } = await query
      setProducts(prods ?? [])
      setLoading(false)
    }
    load()
  }, [sortParam])

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">New Arrivals</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-5 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">New Arrivals</h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Fresh styles just landed — be the first to shop our latest collection
            </p>
            {!loading && (
              <p className="text-muted-foreground text-sm mt-1">{products.length} products</p>
            )}
          </div>

          <Select value={sortParam} onValueChange={setSortParam}>
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
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
            <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Sparkles className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No new arrivals yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Check back soon for fresh styles</p>
            <Button variant="outline" asChild>
              <Link to="/">Continue Shopping</Link>
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
