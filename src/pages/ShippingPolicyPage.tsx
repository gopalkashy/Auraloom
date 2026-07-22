import { Link } from 'react-router-dom'
import { Truck, Package, MapPin, Clock, Shield, ChevronRight } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Layout } from '@/components/layout/Layout'

export function ShippingPolicyPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Shipping Policy</span>
        </nav>

        <div className="space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Truck className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Shipping Policy</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              At AuraLoom, we strive to deliver your orders quickly and safely across India.
              Please read our shipping policy carefully before placing an order.
            </p>
          </div>

          <Separator />

          {/* Sections */}
          <div className="space-y-8">
            {/* 1. Shipping Zones */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="size-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">1. Shipping Zones & Coverage</h2>
              </div>
              <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
                <p>We currently ship to all <strong>pin codes across India</strong>. Our delivery network covers all states and union territories including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Metro cities</strong> — Delhi NCR, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad</li>
                  <li><strong>Tier-2 & Tier-3 cities</strong> — Lucknow, Jaipur, Chandigarh, Indore, Bhopal, Patna, Guwahati, etc.</li>
                  <li><strong>Semi-urban & rural areas</strong> — Most pin codes with courier serviceability</li>
                </ul>
                <p>We do <strong>not</strong> ship internationally at this time. For international inquiries, please contact us at <a href="mailto:hello@auraloom.in" className="text-primary hover:underline">hello@auraloom.in</a>.</p>
              </div>
            </section>

            {/* 2. Shipping Charges */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="size-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">2. Shipping Charges</h2>
              </div>
              <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
                <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Orders above ₹999</span>
                    <span className="text-green-600 font-semibold">FREE Shipping</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Orders below ₹999</span>
                    <span className="text-foreground font-semibold">₹59 Flat Shipping</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>All orders are shipped from our warehouse in <strong>Ahmedabad, Gujarat</strong>.</li>
                    <li>Shipping charges are calculated at checkout and are non-refundable.</li>
                    <li>No hidden charges — the price you see at checkout is final.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Delivery Timeframe */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="size-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">3. Delivery Timeframe</h2>
              </div>
              <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Location</th>
                        <th className="text-left px-4 py-3 font-medium">Standard Delivery</th>
                        <th className="text-left px-4 py-3 font-medium">Express Delivery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-4 py-3 font-medium">Metro Cities</td>
                        <td className="px-4 py-3">3–5 business days</td>
                        <td className="px-4 py-3">1–2 business days</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Tier-2 Cities</td>
                        <td className="px-4 py-3">4–6 business days</td>
                        <td className="px-4 py-3">2–3 business days</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Tier-3 & Rural Areas</td>
                        <td className="px-4 py-3">5–8 business days</td>
                        <td className="px-4 py-3">3–5 business days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ul className="list-disc pl-5 space-y-1 pt-2">
                  <li>Business days exclude Sundays and public holidays.</li>
                  <li>Delivery times are estimated and may vary due to unforeseen circumstances (e.g., weather, festivals, courier delays).</li>
                  <li>Orders placed after <strong>2:00 PM IST</strong> are processed the next business day.</li>
                </ul>
              </div>
            </section>

            {/* 4. Order Processing */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="size-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">4. Order Processing Time</h2>
              </div>
              <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
                <ul className="list-disc pl-5 space-y-1">
                  <li>All orders are processed within <strong>24–48 hours</strong> of placing the order (excluding weekends and holidays).</li>
                  <li>During festive seasons or sale periods, processing may take up to <strong>72 hours</strong>.</li>
                  <li>You will receive a shipping confirmation email with tracking details once your order is dispatched.</li>
                  <li>Cash on Delivery (COD) orders may require additional verification and could take slightly longer.</li>
                </ul>
              </div>
            </section>

            {/* 5. Tracking */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="size-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">5. Order Tracking</h2>
              </div>
              <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
                <p>Once your order is dispatched, you can track it in two ways:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Track from your account</strong> — Visit <Link to="/profile?tab=orders" className="text-primary hover:underline">My Orders</Link> in your AuraLoom account.</li>
                  <li><strong>Track via tracking ID</strong> — Use the tracking number sent to your email/SMS on the courier partner's website.</li>
                </ul>
                <p>If your tracking information hasn't updated in more than <strong>48 hours</strong>, please <Link to="/" className="text-primary hover:underline">contact us</Link> and we'll look into it.</p>
              </div>
            </section>

            {/* 6. COD */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="size-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">6. Cash on Delivery (COD)</h2>
              </div>
              <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
                <ul className="list-disc pl-5 space-y-1">
                  <li>COD is available on orders up to <strong>₹10,000</strong>.</li>
                  <li>A nominal <strong>COD convenience fee of ₹49</strong> is charged on all COD orders.</li>
                  <li>Please ensure you have the exact amount ready at the time of delivery.</li>
                  <li>If a COD order is returned due to delivery failure, a <strong>reverse shipping fee of ₹99</strong> will be deducted from the refund.</li>
                </ul>
              </div>
            </section>

            {/* 7. Delivery Issues */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="size-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">7. Delivery Issues & Undelivered Orders</h2>
              </div>
              <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
                <ul className="list-disc pl-5 space-y-1">
                  <li>If a delivery attempt fails (wrong address, recipient unavailable, etc.), the courier will make <strong>up to 3 attempts</strong> before returning the package to us.</li>
                  <li>Please ensure someone is available to receive the delivery at the provided address.</li>
                  <li>For undelivered orders, a <strong>refund will be processed minus the shipping and return logistics charges</strong>.</li>
                  <li>If your package shows as "delivered" but you haven't received it, contact us within <strong>48 hours</strong> for investigation.</li>
                </ul>
              </div>
            </section>

            {/* 8. Address Changes */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="size-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">8. Address Change Requests</h2>
              </div>
              <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
                <ul className="list-disc pl-5 space-y-1">
                  <li>You can request an address change <strong>within 2 hours</strong> of placing the order by contacting us at <a href="mailto:hello@auraloom.in" className="text-primary hover:underline">hello@auraloom.in</a>.</li>
                  <li>Once the order is processed and handed over to the courier, address changes cannot be guaranteed.</li>
                  <li>We recommend double-checking your shipping address before placing the order.</li>
                </ul>
              </div>
            </section>

            {/* 9. Contact */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="size-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">9. Contact for Shipping Queries</h2>
              </div>
              <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
                <p>For any shipping-related questions, reach out to us:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Email: <a href="mailto:hello@auraloom.in" className="text-primary hover:underline">hello@auraloom.in</a></li>
                  <li>Phone: <a href="tel:+918799764227" className="text-primary hover:underline">+91 8799764227</a></li>
                  <li>Response time: Within 24 hours on business days</li>
                </ul>
              </div>
            </section>
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground text-center">
            This Shipping Policy was last updated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
            AuraLoom reserves the right to modify this policy at any time. Changes will be reflected on this page.
          </p>
        </div>
      </div>
    </Layout>
  )
}
