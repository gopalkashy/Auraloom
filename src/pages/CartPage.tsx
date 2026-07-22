import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Layout } from '@/components/layout/Layout'
import { useCart } from '@/contexts/CartContext'
import { getImageUrl } from '@/lib/supabase'

export function CartPage() {
  const { items, itemCount, total, removeItem, updateQuantity, clearCart } = useCart()
  const navigate = useNavigate()

  const shipping = total >= 999 ? 0 : 59
  const grandTotal = total + shipping

  if (itemCount === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="size-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="size-12 text-muted-foreground/40" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Discover our beautiful collections and start shopping!</p>
          <Button size="lg" asChild>
            <Link to="/">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Shopping Cart ({itemCount} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => {
              const displayPrice = product.sale_price ?? product.price
              const hasDiscount = product.sale_price != null && product.sale_price < product.price

              return (
                <div key={product.id} className="flex gap-4 p-4 bg-card rounded-xl border">
                  <Link to={`/product/${product.slug}`} className="flex-shrink-0">
                    <div className="size-24 md:size-28 rounded-lg overflow-hidden bg-secondary">
                      {product.images?.[0] ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center">
                          <ShoppingBag className="size-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/product/${product.slug}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </Link>
                        {product.subcategory && (
                          <p className="text-xs text-muted-foreground mt-0.5">{product.subcategory.name}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => removeItem(product.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-secondary transition-colors"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium border-x min-w-10 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, Math.min(product.stock_qty, quantity + 1))}
                          className="px-2.5 py-1.5 hover:bg-secondary transition-colors"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold">₹{(displayPrice * quantity).toLocaleString('en-IN')}</p>
                        {hasDiscount && quantity === 1 && (
                          <p className="text-xs text-muted-foreground line-through">
                            ₹{product.price.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground gap-1.5">
                <Trash2 className="size-4" /> Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border p-5 sticky top-24 space-y-4">
              <h2 className="font-bold text-lg">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span>₹{shipping}</span>
                  )}
                </div>
                {shipping > 0 && total < 999 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 p-2.5 rounded-lg">
                    <Tag className="size-3.5 text-primary" />
                    Add ₹{(999 - total).toLocaleString('en-IN')} more for free shipping!
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <Button size="lg" className="w-full gap-2" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <ArrowRight className="size-5" />
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link to="/">Continue Shopping</Link>
              </Button>

              <div className="text-xs text-muted-foreground text-center space-y-1 pt-2">
                <p>🔒 Secure checkout</p>
                <p>💳 Multiple payment options available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
