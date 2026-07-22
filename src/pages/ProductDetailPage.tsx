import * as React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ShoppingBag, Minus, Plus, Truck, Shield, RefreshCw, Check, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageZoom } from '@/components/ui/image-zoom'
import { ProductCard } from '@/components/shop/ProductCard'
import { Layout } from '@/components/layout/Layout'
import { supabase, getImageUrl } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import type { Product } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { addItem, isInCart, getQuantity } = useCart()
  const [product, setProduct] = React.useState<Product | null>(null)
  const [related, setRelated] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedImage, setSelectedImage] = React.useState(0)
  const [qty, setQty] = React.useState(1)
  const [zoomOpen, setZoomOpen] = React.useState(false)

  React.useEffect(() => {
    if (!slug) return
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*, subcategory:subcategories(*, category:categories(*))')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
      if (error) { toast.error('Failed to load product'); setLoading(false); return }
      setProduct(data)
      setSelectedImage(0)
      setQty(1)

      if (data?.subcategory_id) {
        const { data: rel } = await supabase
          .from('products')
          .select('*, subcategory:subcategories(*)')
          .eq('subcategory_id', data.subcategory_id)
          .eq('is_active', true)
          .neq('id', data.id)
          .limit(4)
        setRelated(rel ?? [])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  const inCart = product ? isInCart(product.id) : false
  const cartQty = product ? getQuantity(product.id) : 0

  const handleAddToCart = () => {
    if (!product) return
    if (product.stock_qty <= 0) { toast.error('Out of stock'); return }
    addItem(product, qty)
    toast.success('Added to cart!')
  }

  const displayPrice = product?.sale_price ?? product?.price ?? 0
  const hasDiscount = (product?.discount_percentage ?? 0) > 0 || (product?.sale_price != null && product.sale_price < product.price)
  const discountPct = (product?.discount_percentage ?? 0) > 0
    ? product!.discount_percentage
    : (product?.sale_price != null && product.sale_price < product.price)
      ? Math.round(((product!.price - product!.sale_price) / product!.price) * 100)
      : 0

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="flex gap-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="size-20 rounded-lg" />)}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <Button asChild><Link to="/">Go Home</Link></Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 flex-wrap">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3.5" />
          {product.subcategory?.category && (
            <>
              <Link to={`/category/${product.subcategory.category.slug}`} className="hover:text-primary">
                {product.subcategory.category.name}
              </Link>
              <ChevronRight className="size-3.5" />
            </>
          )}
          {product.subcategory && (
            <>
              <Link to={`/category/${product.subcategory.category?.slug}?sub=${product.subcategory.slug}`} className="hover:text-primary">
                {product.subcategory.name}
              </Link>
              <ChevronRight className="size-3.5" />
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div
              className="relative overflow-hidden rounded-2xl bg-secondary aspect-square cursor-zoom-in group"
              onClick={() => product.images?.length && setZoomOpen(true)}
            >
              {product.images?.[selectedImage] ? (
                <img
                  src={getImageUrl(product.images[selectedImage])}
                  alt={product.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center">
                  <ShoppingBag className="size-20 text-muted-foreground/20" />
                </div>
              )}
              {hasDiscount && (
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                  -{discountPct}% OFF
                </Badge>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                  <ZoomIn className="size-4" />
                  Click to zoom
                </div>
              </div>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'size-20 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0',
                      i === selectedImage ? 'border-primary' : 'border-transparent hover:border-border'
                    )}
                  >
                    <img src={getImageUrl(img)} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {product.subcategory && (
              <Badge variant="secondary" className="text-xs">
                {product.subcategory.name}
              </Badge>
            )}
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Save {discountPct}%
                  </Badge>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.stock_qty > 0 ? (
                <>
                  <div className="size-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    {product.stock_qty <= 5 ? `Only ${product.stock_qty} left in stock!` : 'In Stock'}
                  </span>
                </>
              ) : (
                <>
                  <div className="size-2 rounded-full bg-destructive" />
                  <span className="text-sm text-destructive font-medium">Out of Stock</span>
                </>
              )}
            </div>

            <Separator />

            {/* Quantity + Add to Cart */}
            {product.stock_qty > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="px-4 py-2 font-medium text-sm border-x min-w-12 text-center">{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock_qty, q + 1))}
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>

                <Button size="lg" className="w-full gap-2" onClick={handleAddToCart}>
                  {inCart ? <Check className="size-5" /> : <ShoppingBag className="size-5" />}
                  {inCart ? `In Cart (${cartQty})` : 'Add to Cart'}
                </Button>
              </div>
            )}

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: 'Free Delivery', sub: 'Above ₹999' },
                { icon: Shield, label: 'Authentic', sub: '100% Genuine' },
                { icon: RefreshCw, label: 'Easy Returns', sub: '7 Day Policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-secondary/60">
                  <Icon className="size-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {product.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4 prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.description ?? 'No description available for this product.'}
              </p>
            </TabsContent>
            <TabsContent value="shipping" className="mt-4 text-sm text-muted-foreground space-y-2">
              <p>• Free shipping on orders above ₹999</p>
              <p>• Standard delivery in 5-7 business days</p>
              <p>• Express delivery available at checkout</p>
              <p>• Cash on Delivery available across India</p>
            </TabsContent>
            <TabsContent value="returns" className="mt-4 text-sm text-muted-foreground space-y-2">
              <p>• 7 day hassle-free return policy</p>
              <p>• Item must be unused and in original packaging</p>
              <p>• Contact us to initiate a return request</p>
              <p>• Refund processed within 5-7 business days</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      <ImageZoom
        images={product.images?.map(img => getImageUrl(img)) ?? []}
        initialIndex={selectedImage}
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
      />
    </Layout>
  )
}
