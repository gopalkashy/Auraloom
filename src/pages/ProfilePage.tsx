import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Package, User, LogOut, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
        .select('*, order_items(*)')
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
              <div className="space-y-4">
                {orders.map(order => {
                  const config = STATUS_CONFIG[order.status]
                  return (
                    <div key={order.id} className="bg-card rounded-xl border p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="font-semibold">Order #{order.order_number}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
                            {config.label}
                          </span>
                          <p className="font-bold text-primary">₹{order.total.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {order.order_items && order.order_items.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {order.order_items.slice(0, 5).map(item => (
                            <div key={item.id} className="size-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                              {item.product_image ? (
                                <img src={getImageUrl(item.product_image)} alt="" className="size-full object-cover" />
                              ) : (
                                <div className="size-full flex items-center justify-center">
                                  <ShoppingBag className="size-4 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>
                          ))}
                          {(order.order_items?.length ?? 0) > 5 && (
                            <div className="size-14 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                              +{(order.order_items?.length ?? 0) - 5}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
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
