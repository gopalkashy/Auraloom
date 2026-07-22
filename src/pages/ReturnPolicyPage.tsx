import { Link } from 'react-router-dom'
import { RefreshCw, Shield, Clock, CreditCard, Package, ChevronRight } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Layout } from '@/components/layout/Layout'

export function ReturnPolicyPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Return & Exchange Policy</span>
        </nav>

        <div className="space-y-10">
          <div className="text-center space-y-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <RefreshCw className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Return & Exchange Policy</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We want you to love your purchase. If something isn&apos;t right, we&apos;re here to help
              with a hassle-free return and exchange process.
            </p>
          </div>

          <Separator />

          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="size-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">1. Return Window</h2>
            </div>
            <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
              <ul className="list-disc pl-5 space-y-1">
                <li>You can initiate a return or exchange within <strong>7 days</strong> of delivery.</li>
                <li>Requests made after 7 days from delivery will not be accepted.</li>
                <li>The return window is calculated from the date of delivery as per the courier tracking record.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="size-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">2. Eligibility Criteria</h2>
            </div>
            <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
              <p>To be eligible for a return or exchange, items must meet the following conditions:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Unused and unworn</strong> &mdash; Item must not show any signs of wear, wash, or use.</li>
                <li><strong>Original packaging</strong> &mdash; Tags, boxes, and any accompanying accessories must be intact.</li>
                <li><strong>No damages caused by customer</strong> &mdash; Items damaged due to improper use, mishandling, or alteration will not be accepted.</li>
                <li><strong>Hygiene products</strong> &mdash; Earrings, lingerie, and other intimate items are <strong>not eligible</strong> for return for hygiene reasons.</li>
              </ul>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-3">
                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">Tip: Please try on your items carefully. For clothing, we recommend trying over your own clothes to avoid soiling.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="size-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">3. Exchange Policy</h2>
            </div>
            <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Size exchanges</strong> &mdash; Available for clothing items subject to stock availability.</li>
                <li><strong>Product exchanges</strong> &mdash; You can exchange for a different product of equal or lesser value. Any price difference will be refunded.</li>
                <li><strong>Exchange process</strong> &mdash; We will arrange a reverse pickup and ship the replacement once the original item is received and inspected.</li>
                <li><strong>Exchange timeline</strong> &mdash; Replacement is shipped within 2-3 business days after the returned item is received at our warehouse.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Package className="size-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">4. How to Initiate a Return</h2>
            </div>
            <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
              <p>Follow these steps to initiate a return:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Log in</strong> to your AuraLoom account and go to <Link to="/profile?tab=orders" className="text-primary hover:underline">My Orders</Link>.</li>
                <li>Find the order containing the item you wish to return and click <strong>Request Return</strong>.</li>
                <li>Select the item(s) and provide a reason for the return.</li>
                <li>Upload a photo of the item (optional but recommended for faster processing).</li>
                <li>Submit the request. Our team will review and respond within <strong>24-48 hours</strong>.</li>
              </ol>
              <p className="mt-3">Alternatively, you can contact us directly at <a href="mailto:hello@auraloom.in" className="text-primary hover:underline">hello@auraloom.in</a> with your order number and return reason.</p>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="size-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">5. Refund Policy</h2>
            </div>
            <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
              <div className="overflow-x-auto rounded-xl border mb-3">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Payment Method</th>
                      <th className="text-left px-4 py-3 font-medium">Refund Method</th>
                      <th className="text-left px-4 py-3 font-medium">Processing Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-3 font-medium">Prepaid (Card / UPI / Net Banking)</td>
                      <td className="px-4 py-3">Original payment source</td>
                      <td className="px-4 py-3">5-7 business days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Cash on Delivery (COD)</td>
                      <td className="px-4 py-3">Bank transfer (NEFT)</td>
                      <td className="px-4 py-3">7-10 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Refunds are processed after the returned item is received and quality checked at our warehouse.</li>
                <li>Shipping charges are non-refundable unless the return is due to a defect or error on our part.</li>
                <li>A <strong>reverse shipping fee of ₹99</strong> will be deducted from the refund amount for non-defective returns.</li>
                <li>For COD orders returned due to customer issues, the refund is processed minus both the COD convenience fee and reverse shipping fee.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="size-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">6. Defective or Wrong Item Received</h2>
            </div>
            <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
              <p>If you receive a defective, damaged, or incorrect item:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Contact us within <strong>48 hours</strong> of delivery at <a href="mailto:hello@auraloom.in" className="text-primary hover:underline">hello@auraloom.in</a>.</li>
                <li>Include your order number, a description of the issue, and clear photos showing the defect or discrepancy.</li>
                <li>We will arrange a <strong>free reverse pickup</strong> and ship a replacement immediately (subject to stock availability).</li>
                <li>If the replacement is out of stock, a <strong>full refund including shipping charges</strong> will be issued.</li>
                <li>No reverse shipping fee will be charged for defective or wrong items.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="size-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">7. Order Cancellation</h2>
            </div>
            <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
              <ul className="list-disc pl-5 space-y-1">
                <li>Orders can be cancelled <strong>within 2 hours</strong> of placing them, free of charge.</li>
                <li>Once an order has been processed and shipped, it cannot be cancelled. Please initiate a return instead.</li>
                <li>To cancel, visit <Link to="/profile?tab=orders" className="text-primary hover:underline">My Orders</Link> or email us at <a href="mailto:hello@auraloom.in" className="text-primary hover:underline">hello@auraloom.in</a> with your order number.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="size-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">8. Non-Returnable Items</h2>
            </div>
            <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
              <p>The following items cannot be returned or exchanged:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Earrings, nose pins, and other pierced jewellery (hygiene reasons).</li>
                <li>Lingerie, innerwear, and swimwear.</li>
                <li>Items marked as Final Sale or Non-Returnable on the product page.</li>
                <li>Items without original tags, packaging, or in used condition.</li>
                <li>Customized or personalized items.</li>
                <li>Gift cards and vouchers.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Package className="size-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">9. Need Help?</h2>
            </div>
            <div className="pl-13 space-y-2 text-muted-foreground text-sm leading-relaxed">
              <p>If you have any questions about our return policy, please reach out:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Email: <a href="mailto:hello@auraloom.in" className="text-primary hover:underline">hello@auraloom.in</a></li>
                <li>Phone: <a href="tel:+918799764227" className="text-primary hover:underline">+91 8799764227</a></li>
                <li>Response time: Within 24 hours on business days</li>
                <li>We&apos;re available Monday to Saturday, 10:00 AM to 7:00 PM IST</li>
              </ul>
            </div>
          </section>

          <Separator />

          <p className="text-xs text-muted-foreground text-center">
            This Return &amp; Exchange Policy was last updated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
            AuraLoom reserves the right to modify this policy at any time. Changes will be reflected on this page.
          </p>
        </div>
      </div>
    </Layout>
  )
}
