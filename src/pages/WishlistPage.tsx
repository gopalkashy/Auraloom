import * as React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/layout/Layout'
import { supabase, getImageUrl } from '@/lib/supabase'
import type { Product } from '@/types'
import { toast } from 'sonner'

const WISHLIST_KEY = 'auraloom_wishlist'

function getWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]')
  } catch {
    return []
  }
}

function saveWishlist(ids: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids))
  window.dispatchEvent(new CustomEvent('wishlist-changed'))
}

export function WishlistPage() {
  const [productIds, setProductIds] = React.useState<string[]>(getWishlist())
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      if (productIds.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*, subcategory:subcategories(*, category:categories(*))')
        .in('id', productIds)
      if (error) { toast.error('Failed to load wishlist'); setLoading(false); return }
      setProducts(data ?? [])
      setLoading(false)
    }
    load()
  }, [productIds])

  React.useEffect(() => {
    const handleChange = () => setProductIds(getWishlist())
    window.addEventListener('wishlist-changed', handleChange)
    return () => window.removeEventListener('wishlist-changed', handleChange)
  }, [])

  const removeFromWishlist = (productId: string) => {
    const updated = productIds.filter(id => id !== productId)
    setProductIds(updated)
    saveWishlist(updated)
    toast.success('Removed from wishlist')
  }

  const clearWishlist = () => {
    setProductIds([])
    saveWishlist([])
    toast.success('Wishlist cleared')
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground text-sm">
              {!loading && `${products.length} item${products.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
          {products.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearWishlist} className="gap-1.5 text-destructive">
              <Trash2 className="size-4" /> Clear All
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Heart className="size-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-sm mb-6">Save items you love by clicking the heart icon</p>
            <Button asChild>
              <Link to="/">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => {
              const displayPrice = product.sale_price ?? product.price
              return (
                <div key={product.id} className="group relative">
                  <Link to={`/product/${product.slug}`} className="block">
                    <div className="relative overflow-hidden rounded-xl bg-secondary aspect-[3/4]">
                      {product.images?.[0] ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center">
                          <ShoppingBag className="size-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeFromWishlist(product.id)
                        }}
                        className="absolute top-2 right-2 size-8 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center shadow-sm transition-colors"
                      >
                        <Heart className="size-4 fill-current" />
                      </button>
                    </div>
                    <div className="pt-3 space-y-1">
                      <p className="text-xs text-muted-foreground truncate">
                        {product.subcategory?.name ?? ''}
                      </p>
                      <h3 className="text-sm font-medium leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="font-semibold">
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
