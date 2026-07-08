import * as React from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/shop/ProductCard'
import { Layout } from '@/components/layout/Layout'
import { supabase } from '@/lib/supabase'
import type { Category, Subcategory, Product } from '@/types'

export function ProductsPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const subcategorySlug = searchParams.get('sub')
  const sortParam = searchParams.get('sort') ?? 'newest'

  const [category, setCategory] = React.useState<Category | null>(null)
  const [subcategories, setSubcategories] = React.useState<Subcategory[]>([])
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filterOpen, setFilterOpen] = React.useState(false)

  React.useEffect(() => {
    if (!categorySlug) return
    const load = async () => {
      setLoading(true)
      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .eq('is_active', true)
        .single()
      setCategory(cat)

      if (cat) {
        const { data: subs } = await supabase
          .from('subcategories')
          .select('*')
          .eq('category_id', cat.id)
          .eq('is_active', true)
          .order('sort_order')
        setSubcategories(subs ?? [])

        let query = supabase
          .from('products')
          .select('*, subcategory:subcategories(*, category:categories(*))')
          .eq('is_active', true)

        if (subcategorySlug) {
          const sub = (subs ?? []).find(s => s.slug === subcategorySlug)
          if (sub) query = query.eq('subcategory_id', sub.id)
          else query = query.in('subcategory_id', (subs ?? []).map(s => s.id))
        } else {
          query = query.in('subcategory_id', (subs ?? []).map(s => s.id))
        }

        if (sortParam === 'price_asc') query = query.order('price', { ascending: true })
        else if (sortParam === 'price_desc') query = query.order('price', { ascending: false })
        else if (sortParam === 'featured') query = query.eq('is_featured', true).order('created_at', { ascending: false })
        else query = query.order('created_at', { ascending: false })

        const { data: prods } = await query
        setProducts(prods ?? [])
      }
      setLoading(false)
    }
    load()
  }, [categorySlug, subcategorySlug, sortParam])

  const setFilter = (key: string, value: string | null) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  const activeSubcategory = subcategories.find(s => s.slug === subcategorySlug)

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          {category ? (
            <span className="text-foreground font-medium">{category.name}</span>
          ) : (
            <Skeleton className="h-4 w-24" />
          )}
          {activeSubcategory && (
            <>
              <ChevronRight className="size-3.5" />
              <span className="text-foreground font-medium">{activeSubcategory.name}</span>
            </>
          )}
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {activeSubcategory?.name ?? category?.name ?? <Skeleton className="h-8 w-40" />}
            </h1>
            {(category?.description || activeSubcategory?.description) && (
              <p className="text-muted-foreground mt-1 text-sm">
                {activeSubcategory?.description ?? category?.description}
              </p>
            )}
            {!loading && (
              <p className="text-muted-foreground text-sm mt-1">{products.length} products</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Select value={sortParam} onValueChange={v => setFilter('sort', v)}>
              <SelectTrigger className="h-9 w-36 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <SlidersHorizontal className="size-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3">Subcategory</h3>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { setFilter('sub', null); setFilterOpen(false) }}
                      className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${!subcategorySlug ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                    >
                      All {category?.name}
                    </button>
                    {subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => { setFilter('sub', sub.slug); setFilterOpen(false) }}
                        className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${subcategorySlug === sub.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Subcategory pills */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setFilter('sub', null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!subcategorySlug ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary hover:text-primary'}`}
            >
              All
            </button>
            {subcategories.map(sub => (
              <button
                key={sub.id}
                onClick={() => setFilter('sub', sub.slug)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${subcategorySlug === sub.slug ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary hover:text-primary'}`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        {loading ? (
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
            <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters</p>
            <Button variant="outline" onClick={() => setFilter('sub', null)}>Clear Filters</Button>
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
