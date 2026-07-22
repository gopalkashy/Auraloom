import * as React from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { CheckCircle, Package, MapPin, ShoppingBag, Truck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Layout } from '@/components/layout/Layout'
import { supabase, getImageUrl } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Order } from '@/types'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Order Placed', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  confirmed: { label: 'Confirmed', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  returned: { label: 'Returned', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
}

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const location = useLocation()
  const [order, setOrder] = React.useState<Order | null>(null)
  const [loading, setLoading] = React.useState(true)
  const hasShownToast = React.useRef(false)

  React.useEffect(() => {
    if (!orderId) return
    const load = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single()
      setOrder(data)
      setLoading(false)

      // Show success toast once when arriving from checkout
      if (location.state?.fromCheckout && !hasShownToast.current) {
        hasShownToast.current = true
        toast.success('Order placed successfully!', {
          description: `Order #${data?.order_number} has been confirmed.`,
        })
      }
    }
    load()
  }, [orderId, location.state])

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto mb-8" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </Layout>
    )
  }

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Button asChild><Link to="/">Go Home</Link></Button>
        </div>
      </Layout>
    )
  }

  const statusConfig = STATUS_CONFIG[order.status]

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="size-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for shopping with AuraLoom. Your order has been placed successfully.
          </p>
          <p className="text-sm font-medium mt-2">
            Order Number: <span className="text-primary">{order.order_number}</span>
          </p>
        </div>

        <div className="space-y-4">
          {/* Order Status */}
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Order Status</h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Package className="size-4 text-primary" />
              <span>Estimated delivery in 5-7 business days</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Items Ordered</h2>
            <div className="space-y-3">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="size-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {item.product_image ? (
                      <img src={getImageUrl(item.product_image)} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="size-full flex items-center justify-center">
                        <ShoppingBag className="size-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">₹{item.subtotal.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={order.shipping_cost === 0 ? 'text-green-600' : ''}>
                  {order.shipping_cost === 0 ? 'FREE' : `₹${order.shipping_cost}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total Paid</span>
                <span className="text-primary">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-card rounded-xl border p-5">
            <h2 className="font-semibold mb-3">Delivering To</h2>
            <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <MapPin className="size-4 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">{order.shipping_name}</p>
                <p>{order.shipping_phone}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button asChild className="flex-1 gap-2">
            <Link to="/profile?tab=orders">
              <Package className="size-4" />
              View Order Details
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 gap-2">
            <Link to="/profile?tab=orders">
              <Truck className="size-4" />
              Track Order
            </Link>
          </Button>
          <Button variant="secondary" asChild className="flex-1 gap-2">
            <Link to="/">
              <ArrowLeft className="size-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  )
}
