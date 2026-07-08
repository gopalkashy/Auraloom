import * as React from 'react'
import { Link } from 'react-router-dom'
import { Package, Tag, ShoppingCart, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminLayout } from './AdminLayout'
import { supabase } from '@/lib/supabase'

interface Stats {
  products: number
  categories: number
  orders: number
  revenue: number
  recentOrders: Array<{
    id: string
    order_number: string
    total: number
    status: string
    created_at: string
    shipping_name: string | null
  }>
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600',
  processing: 'text-blue-600',
  shipped: 'text-purple-600',
  delivered: 'text-green-600',
  cancelled: 'text-red-600',
}

export function AdminDashboard() {
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      const [
        { count: products },
        { count: categories },
        { count: orders },
        { data: revenue },
        { data: recentOrders },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total').eq('payment_status', 'paid'),
        supabase.from('orders').select('id, order_number, total, status, created_at, shipping_name').order('created_at', { ascending: false }).limit(5),
      ])

      const totalRevenue = (revenue ?? []).reduce((sum, o) => sum + o.total, 0)

      setStats({
        products: products ?? 0,
        categories: categories ?? 0,
        orders: orders ?? 0,
        revenue: totalRevenue,
        recentOrders: recentOrders ?? [],
      })
      setLoading(false)
    }
    load()
  }, [])

  const METRIC_CARDS = [
    { label: 'Total Products', value: stats?.products, icon: Package, color: 'text-primary', href: '/admin/products' },
    { label: 'Categories', value: stats?.categories, icon: Tag, color: 'text-blue-500', href: '/admin/categories' },
    { label: 'Total Orders', value: stats?.orders, icon: ShoppingCart, color: 'text-purple-500', href: '/admin/orders' },
    { label: 'Revenue (Paid)', value: stats ? `₹${stats.revenue.toLocaleString('en-IN')}` : null, icon: TrendingUp, color: 'text-green-500', href: null },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome to AuraLoom Admin</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {METRIC_CARDS.map(({ label, value, icon: Icon, color, href }) => {
            const CardWrapper = href ? Link : 'div'
            return (
              <Card key={label} className={href ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                    <Icon className={`size-5 ${color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : href ? (
                    <CardWrapper to={href} className="text-2xl font-bold hover:text-primary transition-colors">
                      {value}
                    </CardWrapper>
                  ) : (
                    <p className="text-2xl font-bold">{value}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : stats?.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 font-medium">Order #</th>
                      <th className="text-left py-2 font-medium">Customer</th>
                      <th className="text-left py-2 font-medium">Amount</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-left py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats?.recentOrders.map(order => (
                      <tr key={order.id}>
                        <td className="py-2.5">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="py-2.5 text-muted-foreground">{order.shipping_name ?? '—'}</td>
                        <td className="py-2.5 font-medium">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className={`py-2.5 font-medium capitalize ${STATUS_COLORS[order.status] ?? ''}`}>
                          {order.status}
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick tip for new admins */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Getting Started</p>
          <p>1. Add categories under <strong>Categories</strong> tab</p>
          <p>2. Add products with photos under <strong>Products</strong> tab</p>
          <p>3. Manage customer orders under <strong>Orders</strong> tab</p>
        </div>
      </div>
    </AdminLayout>
  )
}
