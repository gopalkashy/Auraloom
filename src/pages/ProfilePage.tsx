import * as React from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Package, User, LogOut, ShoppingBag, ChevronDown, ChevronUp, MapPin, Phone, CreditCard, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Layout } from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, getImageUrl } from '@/lib/supabase'
import type { Order } from '@/types'
import { toast } from 'sonner'

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

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  paid: { label: 'Paid', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'secondary' },
}

function OrderList({ orders }: { orders: Order[] }) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  return (
    <div className="space-y-4">
      {orders.map(order => {
        const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
        const paymentCfg = PAYMENT_STATUS_CONFIG[order.payment_status] ?? PAYMENT_STATUS_CONFIG.pending
        const expanded = expandedId === order.id
        return (
          <div key={order.id} className="bg-card rounded-xl border overflow-hidden">
            {/* Summary row */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold">Order #{order.order_number}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>{config.label}</span>
                  <p className="font-bold text-primary">₹{order.total.toLocaleString('en-IN')}</p>
                </div>
              </div>
              {order.order_items && order.order_items.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {order.order_items.slice(0, 5).map(item => {
                    const slug = (item as any).product?.slug
                    const thumb = (
                      <div key={item.id} className="size-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        {item.product_image
                          ? <img src={getImageUrl(item.product_image)} alt={item.product_name} className="size-full object-cover" />
                          : <div className="size-full flex items-center justify-center"><ShoppingBag className="size-4 text-muted-foreground/30" /></div>}
                      </div>
                    )
                    return slug
                      ? <Link key={item.id} to={`/product/${slug}`} className="flex-shrink-0 hover:opacity-80 transition-opacity">{thumb}</Link>
                      : thumb
                  })}
                  {(order.order_items?.length ?? 0) > 5 && (
                    <div className="size-14 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                      +{(order.order_items?.length ?? 0) - 5}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setExpandedId(expanded ? null : order.id)}
                className="mt-4 flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
              >
                {expanded ? <><ChevronUp className="size-3.5" /> Hide Details</> : <><ChevronDown className="size-3.5" /> View Details</>}
              </button>
            </div>

            {/* Expanded detail */}
            {expanded && (
              <div className="border-t px-5 pb-5 pt-4 space-y-6">
                {/* Status Timeline */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Clock className="size-4" /> Status Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 flex-wrap">
                      {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((s, i, arr) => {
                        const isActive = order.status === s
                        const isPast = arr.indexOf(order.status) > i || isActive
                        const cfg = STATUS_CONFIG[s]
                        return (
                          <React.Fragment key={s}>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                              isPast ? cfg?.className : 'bg-secondary text-muted-foreground'
                            } ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                              {isPast && !isActive && <CheckCircle className="size-3" />}
                              {cfg?.label}
                            </div>
                            {i < arr.length - 1 && <div className={`w-6 h-0.5 ${isPast ? 'bg-primary' : 'bg-border'}`} />}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Order Items */}
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2"><Package className="size-4" /> Items ({order.order_items?.length ?? 0})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {order.order_items?.map(item => {
                        const slug = (item as any).product?.slug
                        return (
                        <div key={item.id} className="flex gap-4 items-start">
                          <div className="size-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                            {slug ? (
                              <Link to={`/product/${slug}`} className="block size-full hover:opacity-80 transition-opacity">
                                {item.product_image
                                  ? <img src={getImageUrl(item.product_image)} alt="" className="size-full object-cover" />
                                  : <div className="size-full flex items-center justify-center"><Package className="size-5 text-muted-foreground/30" /></div>}
                              </Link>
                            ) : (
                              item.product_image
                                ? <img src={getImageUrl(item.product_image)} alt="" className="size-full object-cover" />
                                : <div className="size-full flex items-center justify-center"><Package className="size-5 text-muted-foreground/30" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {slug ? (
                              <Link to={`/product/${slug}`} className="font-medium line-clamp-2 hover:text-primary transition-colors">
                                {item.product_name}
                              </Link>
                            ) : (
                              <p className="font-medium line-clamp-2">{item.product_name}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p>
                          </div>
                          <p className="font-semibold">₹{item.subtotal.toLocaleString('en-IN')}</p>
                        </div>
                        )
                      })}
                      <Separator />
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
                        {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount.toLocaleString('en-IN')}</span></div>}
                        <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{order.shipping_cost === 0 ? 'Free' : `₹${order.shipping_cost.toLocaleString('en-IN')}`}</span></div>
                        <Separator />
                        <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">₹{order.total.toLocaleString('en-IN')}</span></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipping Address */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2"><MapPin className="size-4" /> Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p className="font-medium">{order.shipping_name}</p>
                      {order.shipping_phone && (
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Phone className="size-3.5" />{order.shipping_phone}</div>
                      )}
                      <p className="text-muted-foreground">{order.shipping_address}</p>
                      <p className="text-muted-foreground">{order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}</p>
                    </CardContent>
                  </Card>

                  {/* Payment */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2"><CreditCard className="size-4" /> Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method === 'upi' ? 'UPI' : order.payment_method === 'card' ? 'Card' : 'COD'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={paymentCfg.variant} className="text-xs">{paymentCfg.label}</Badge></div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ProfilePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'orders'
  const { user, profile, signOut, refreshProfile } = useAuth()
  const [orders, setOrders] = React.useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [profileForm, setProfileForm] = React.useState({
    full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', pincode: '',
  })

  React.useEffect(() => {
    if (!user) { navigate('/login'); return }
    const loadOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(slug))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(data ?? [])
      setLoadingOrders(false)
    }
    loadOrders()
  }, [user, navigate])

  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
        address_line1: profile.address_line1 ?? '',
        address_line2: profile.address_line2 ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
        pincode: profile.pincode ?? '',
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ ...profileForm, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    if (error) toast.error('Failed to save')
    else { toast.success('Profile updated!'); refreshProfile() }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfileForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Account</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
            <LogOut className="size-4" /> Sign Out
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })}>
          <TabsList className="mb-6">
            <TabsTrigger value="orders" className="gap-1.5"><Package className="size-4" /> My Orders</TabsTrigger>
            <TabsTrigger value="account" className="gap-1.5"><User className="size-4" /> Account Details</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {loadingOrders ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="size-8 text-muted-foreground/40" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
                <p className="text-muted-foreground text-sm mb-6">Start shopping to see your orders here</p>
                <Button asChild><a href="/">Browse Products</a></Button>
              </div>
            ) : (
              <OrderList orders={orders} />
            )}
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="bg-card rounded-xl border p-6 space-y-5">
              <h2 className="font-semibold">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={profileForm.full_name} onChange={set('full_name')} placeholder="Your full name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={profileForm.phone} onChange={set('phone')} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={user?.email ?? ''} disabled className="opacity-60" />
                </div>
              </div>

              <Separator />
              <h2 className="font-semibold">Default Address</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Address Line 1</Label>
                  <Input value={profileForm.address_line1} onChange={set('address_line1')} placeholder="House/Flat No., Street" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Address Line 2</Label>
                  <Input value={profileForm.address_line2} onChange={set('address_line2')} placeholder="Area, Landmark" />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input value={profileForm.city} onChange={set('city')} placeholder="City" />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input value={profileForm.state} onChange={set('state')} placeholder="State" />
                </div>
                <div className="space-y-1.5">
                  <Label>Pincode</Label>
                  <Input value={profileForm.pincode} onChange={set('pincode')} placeholder="6-digit pincode" maxLength={6} />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
