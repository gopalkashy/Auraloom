import * as React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShoppingBag, Lock, CreditCard, Banknote, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Layout } from '@/components/layout/Layout'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, getImageUrl } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const checkoutSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, '6-digit pincode required'),
  payment_method: z.enum(['cod', 'upi', 'card']),
  notes: z.string().optional(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, itemCount, clearCart } = useCart()
  const { user, profile } = useAuth()
  const [submitting, setSubmitting] = React.useState(false)

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      address: profile?.address_line1 ?? '',
      city: profile?.city ?? '',
      state: profile?.state ?? '',
      pincode: profile?.pincode ?? '',
      payment_method: 'cod',
    },
  })

  const shipping = total >= 999 ? 0 : 99
  const grandTotal = total + shipping

  const onSubmit = async (data: CheckoutForm) => {
    if (!user) { navigate('/login?redirect=/checkout'); return }
    if (itemCount === 0) { toast.error('Your cart is empty'); return }

    setSubmitting(true)
    try {
      const orderNumber = `AL${Date.now().toString().slice(-8)}`

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          payment_status: data.payment_method === 'cod' ? 'pending' : 'paid',
          subtotal: total,
          discount: 0,
          total: grandTotal,
          shipping_name: data.full_name,
          shipping_phone: data.phone,
          shipping_address: data.address,
          shipping_city: data.city,
          shipping_state: data.state,
          shipping_pincode: data.pincode,
          notes: data.notes ?? null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = items.map(({ product, quantity }) => ({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] ?? null,
        quantity,
        price: product.sale_price ?? product.price,
        subtotal: (product.sale_price ?? product.price) * quantity,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      clearCart()
      navigate(`/order-confirmation/${order.id}`, { state: { fromCheckout: true } })
    } catch (err) {
      toast.error('Failed to place order. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (itemCount === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Button asChild><Link to="/">Shop Now</Link></Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-card rounded-xl border p-5">
                <h2 className="font-semibold text-base mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" {...form.register('full_name')} placeholder="Your full name" />
                    {form.formState.errors.full_name && (
                      <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" {...form.register('phone')} placeholder="+91 XXXXX XXXXX" type="tel" />
                    {form.formState.errors.phone && (
                      <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea id="address" {...form.register('address')} placeholder="House/Flat No., Street, Area" rows={2} />
                    {form.formState.errors.address && (
                      <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...form.register('city')} placeholder="City" />
                    {form.formState.errors.city && (
                      <p className="text-xs text-destructive">{form.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" {...form.register('state')} placeholder="State" />
                    {form.formState.errors.state && (
                      <p className="text-xs text-destructive">{form.formState.errors.state.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input id="pincode" {...form.register('pincode')} placeholder="6-digit pincode" maxLength={6} />
                    {form.formState.errors.pincode && (
                      <p className="text-xs text-destructive">{form.formState.errors.pincode.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="notes">Order Notes (optional)</Label>
                    <Textarea id="notes" {...form.register('notes')} placeholder="Any special instructions..." rows={2} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-xl border p-5">
                <h2 className="font-semibold text-base mb-4">Payment Method</h2>
                <RadioGroup
                  defaultValue="cod"
                  onValueChange={v => form.setValue('payment_method', v as 'cod' | 'upi' | 'card')}
                >
                  {[
                    { value: 'cod', icon: Banknote, label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                    { value: 'upi', icon: Smartphone, label: 'UPI Payment', desc: 'Pay via GPay, PhonePe, Paytm (Simulated)' },
                    { value: 'card', icon: CreditCard, label: 'Credit / Debit Card', desc: 'Secure card payment (Simulated)' },
                  ].map(({ value, icon: Icon, label, desc }) => (
                    <label
                      key={value}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-secondary/50',
                        form.watch('payment_method') === value && 'border-primary bg-primary/5'
                      )}
                    >
                      <RadioGroupItem value={value} id={value} />
                      <Icon className="size-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border p-5 sticky top-24 space-y-4">
                <h2 className="font-bold text-base">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3">
                      <div className="size-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={getImageUrl(product.images[0])} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="size-full flex items-center justify-center">
                            <ShoppingBag className="size-4 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-2">{product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                      </div>
                      <p className="text-xs font-semibold flex-shrink-0">
                        ₹{((product.sale_price ?? product.price) * quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                  <Lock className="size-4" />
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    <Link to="/login?redirect=/checkout" className="text-primary hover:underline">Login</Link> to save your order history
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}
