import * as React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { getImageUrl } from '@/lib/supabase'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'
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

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, isInCart } = useCart()
  const inCart = isInCart(product.id)
  const [isWishlisted, setIsWishlisted] = React.useState(() => getWishlist().includes(product.id))

  const displayPrice = product.sale_price ?? product.price
  const hasDiscount = (product.discount_percentage > 0) || (product.sale_price != null && product.sale_price < product.price)
  const discountPct = product.discount_percentage > 0
    ? product.discount_percentage
    : (product.sale_price != null && product.sale_price < product.price)
      ? Math.round(((product.price - product.sale_price) / product.price) * 100)
      : 0

  const primaryImage = product.images?.[0]
  const secondaryImage = product.images?.[1]

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock_qty <= 0) {
      toast.error('This item is out of stock')
      return
    }
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const wishlist = getWishlist()
    if (isWishlisted) {
      const updated = wishlist.filter(id => id !== product.id)
      saveWishlist(updated)
      setIsWishlisted(false)
      toast.success('Removed from wishlist')
    } else {
      wishlist.push(product.id)
      saveWishlist(wishlist)
      setIsWishlisted(true)
      toast.success('Added to wishlist')
    }
  }

  React.useEffect(() => {
    const handleChange = () => setIsWishlisted(getWishlist().includes(product.id))
    window.addEventListener('wishlist-changed', handleChange)
    return () => window.removeEventListener('wishlist-changed', handleChange)
  }, [product.id])

  return (
    <div className={cn('group relative', className)}>
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative overflow-hidden rounded-xl bg-secondary aspect-[3/4]">
          {primaryImage ? (
            <img
              src={getImageUrl(primaryImage)}
              alt={product.name}
              className={cn(
                'size-full object-cover transition-transform duration-500 group-hover:scale-105',
                secondaryImage && 'group-hover:opacity-0'
              )}
            />
          ) : (
            <div className="size-full flex items-center justify-center bg-secondary">
              <ShoppingBag className="size-12 text-muted-foreground/30" />
            </div>
          )}
          {secondaryImage && (
            <img
              src={getImageUrl(secondaryImage)}
              alt={product.name}
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {hasDiscount && (
              <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5">
                -{discountPct}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge variant="secondary" className="text-[10px] font-medium px-1.5">
                ⭐ Featured
              </Badge>
            )}
            {product.stock_qty === 0 && (
              <Badge variant="outline" className="bg-background text-[10px] px-1.5">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={toggleWishlist}
            className={cn(
              "absolute top-2 right-2 size-8 rounded-full flex items-center justify-center shadow-sm transition-all",
              isWishlisted
                ? "bg-primary text-primary-foreground opacity-100"
                : "bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100"
            )}
          >
            <Heart className={cn("size-4", isWishlisted && "fill-current")} />
          </button>

          {/* Add to cart overlay */}
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock_qty === 0}
              className={cn(
                'w-full rounded-none rounded-b-xl h-10 text-sm font-medium',
                inCart && 'bg-green-600 hover:bg-green-700'
              )}
            >
              <ShoppingBag className="size-4 mr-1.5" />
              {inCart ? 'In Cart' : 'Add to Cart'}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3 space-y-1">
          <p className="text-xs text-muted-foreground truncate">
            {product.subcategory?.name ?? ''}
          </p>
          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
