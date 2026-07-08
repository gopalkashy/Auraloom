import * as React from 'react'
import { Link } from 'react-router-dom'
import { Tag, ChevronRight, Percent, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/shop/ProductCard'
import { Layout } from '@/components/layout/Layout'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

export function OfferZonePage() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sortParam, setSortParam] = React.useState('discount')

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: prods } = await supabase
        .from('products')
        .select('*, subcategory:subcategories(*, category:categories(*))')
        .eq('is_active', true)
        .not('sale_price', 'is', null)

      let filtered = (prods ?? []).filter(
        p => p.sale_price != null && p.sale_price < p.price
      )

      if (sortParam === 'discount') {
        filtered.sort((a, b) => {
          const discA = (a.price - (a.sale_price ?? a.price)) / a.price
          const discB = (b.price - (b.sale_price ?? b.price)) / b.price
          return discB - discA
        })
      } else if (sortParam === 'price_asc') {
        filtered.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price))
      } else if (sortParam === 'price_desc') {
        filtered.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price))
      } else {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }

      setProducts(filtered)
      setLoading(false)
    }
    load()
  }, [sortParam])

  const maxDiscount = products.length > 0
    ? Math.round(Math.max(...products.map(p => ((p.price - (p.sale_price ?? p.price)) / p.price) * 100)))
    : 0

  return (
    <Layout>
      {/* Offer banner */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Percent className="size-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                <Flame className="size-6 text-primary" />
                Offer Zone
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Unbeatable deals on your favourite styles{maxDiscount > 0 ? ` — up to ${maxDiscount}% off!` : ''}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Offer Zone</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            {!loading && (
              <p className="text-muted-foreground text-sm">{products.length} products on sale</p>
            )}
          </div>

          <Select value={sortParam} onValueChange={setSortParam}>
            <SelectTrigger className="h-9 w-40 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discount">Biggest Discount</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
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
              <Tag className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No offers available right now</h3>
            <p className="text-muted-foreground text-sm mb-4">Check back soon for exciting deals</p>
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
