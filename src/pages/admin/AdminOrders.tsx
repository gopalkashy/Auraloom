import * as React from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { AdminLayout } from './AdminLayout'
import { supabase, getImageUrl } from '@/lib/supabase'
import type { Order, OrderItem } from '@/types'
import { toast } from 'sonner'

type OrderWithItems = Order & { order_items: OrderItem[] }

const ALL_STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'] as const
type OrderStatus = typeof ALL_STATUS_OPTIONS[number]

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  confirmed: { label: 'Confirmed', className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  shipped: { label: 'Shipped', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  delivered: { label: 'Delivered', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  returned: { label: 'Returned', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
}

export function AdminOrders() {
  const [orders, setOrders] = React.useState<OrderWithItems[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filterStatus, setFilterStatus] = React.useState<string>('all')
  const [selectedOrder, setSelectedOrder] = React.useState<OrderWithItems | null>(null)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const load = async () => {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (filterStatus !== 'all') query = query.eq('status', filterStatus)

    const { data, error } = await query
    if (error) { toast.error('Failed to load orders'); return }
    setOrders(data ?? [])
    setLoading(false)
  }

  React.useEffect(() => { setLoading(true); load() }, [filterStatus])

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId)
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) { toast.error('Failed to update status') }
    else {
      toast.success('Status updated')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status } : prev)
    }
    setUpdatingId(null)
  }

  const filtered = orders

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Orders</h1>
            <p className="text-muted-foreground text-sm">Manage customer orders</p>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              {ALL_STATUS_OPTIONS.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{STATUS_CONFIG[s]?.label ?? s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order #</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payment</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(order => {
                    const cfg = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.pending
                    return (
                      <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {order.order_number}
                            <ExternalLink className="size-3 opacity-60" />
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{order.shipping_name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{order.shipping_phone ?? ''}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">
                            {order.payment_status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={order.status}
                            onValueChange={(v) => updateStatus(order.id, v as OrderStatus)}
                            disabled={updatingId === order.id}
                          >
                            <SelectTrigger className="h-7 w-32 text-xs">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.className}`}>
                                {cfg.label}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {ALL_STATUS_OPTIONS.map(s => (
                                <SelectItem key={s} value={s} className="text-xs">{STATUS_CONFIG[s]?.label ?? s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-5 py-1">
              {/* Status update */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(v) => updateStatus(selectedOrder.id, v as OrderStatus)}
                  disabled={!!updatingId}
                >
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s} className="text-xs">{STATUS_CONFIG[s]?.label ?? s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant={selectedOrder.payment_status === 'paid' ? 'default' : 'secondary'} className="text-[10px] ml-auto">
                  {selectedOrder.payment_status}
                </Badge>
              </div>

              <Separator />

              {/* Shipping address */}
              <div>
                <p className="text-sm font-semibold mb-2">Shipping Address</p>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p className="text-foreground font-medium">{selectedOrder.shipping_name}</p>
                  <p>{selectedOrder.shipping_phone}</p>
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} — {selectedOrder.shipping_pincode}</p>
                  {selectedOrder.notes && <p className="italic mt-1">Note: {selectedOrder.notes}</p>}
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <p className="text-sm font-semibold mb-3">Items ({selectedOrder.order_items?.length ?? 0})</p>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map(item => (
                    <div key={item.id} className="flex gap-3 items-start">
                      <div className="size-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        {item.product_image ? (
                          <img src={getImageUrl(item.product_image)} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="size-full bg-secondary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold flex-shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{selectedOrder.shipping_cost === 0 ? 'Free' : `₹${selectedOrder.shipping_cost}`}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
