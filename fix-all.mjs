import fs from 'fs'

// ======== HELPER ========
function fix(fp, oldStr, newStr) {
  let content = fs.readFileSync(fp, 'utf8')
  if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr)
    fs.writeFileSync(fp, content, 'utf8')
    console.log(`  Fixed: ${fp.split('/').pop()}`)
    return true
  } else {
    console.log(`  NOT FOUND in ${fp.split('/').pop()} -- searching context...`)
    return false
  }
}

function verify(fp) {
  let content = fs.readFileSync(fp, 'utf8')
  const divOpens = (content.match(/<div[^>]*>/g)||[]).filter(t => !t.endsWith('/>')).length
  const divCloses = (content.match(/<\/div>/g)||[]).length
  const layoutO = (content.match(/<Layout>/g)||[]).length
  const layoutC = (content.match(/<\/Layout>/g)||[]).length
  const sectionO = (content.match(/<section[^>]*>/g)||[]).length
  const sectionC = (content.match(/<\/section>/g)||[]).length
  console.log(`  Verify: div=${divOpens}/${divCloses} ${divOpens===divCloses?'OK':'FAIL'} | Layout=${layoutO}/${layoutC} ${layoutO===layoutC?'OK':'FAIL'} | section=${sectionO}/${sectionC} ${sectionO===sectionC?'OK':'FAIL'}`)
  return divOpens === divCloses && layoutO === layoutC && sectionO === sectionC
}

// ======== 1. ReturnPolicyPage.tsx ========
console.log('\n=== ReturnPolicyPage.tsx ===')
const rtn = 'C:/Users/611626781/Downloads/AuraLoom/project/src/pages/ReturnPolicyPage.tsx'

// Read and check
let content = fs.readFileSync(rtn, 'utf8')

// The section 2 ending is broken - find it and rewrite
// Look for the pattern around section 2
const section2Start = content.indexOf('{/* 2. Eligibility Criteria */}')
const section3Start = content.indexOf('{/* 3. Exchange Policy */}')

console.log(`Section 2 starts at: ${section2Start}, Section 3 starts at: ${section3Start}`)

if (section2Start >= 0 && section3Start >= 0) {
  // Extract section 2 content
  const section2Content = content.substring(section2Start, section3Start)
  console.log('Section 2 content:')
  console.log(JSON.stringify(section2Content.substring(0, 100)) + '...')
  console.log('...ends with:')
  console.log(JSON.stringify(section2Content.substring(section2Content.length - 100)))

  // Check if broken (missing amber div wrapper)
  if (section2Content.includes('Tip: Please try') && !section2Content.includes('bg-amber')) {
    console.log('Section 2 is broken! Will rewrite the entire section')
  }
}

// Rewrite the whole file fresh to avoid CRLF issues
const correctRtn = `import { Link } from 'react-router-dom'
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
    </Layout>
  )
}
`

fs.writeFileSync(rtn, correctRtn, 'utf8')
console.log('  Rewrote ReturnPolicyPage.tsx fresh')

// Verify
verify(rtn)

// ======== 2. Footer.tsx ========
console.log('\n=== Footer.tsx ===')
const footer = 'C:/Users/611626781/Downloads/AuraLoom/project/src/components/layout/Footer.tsx'
let footerContent = fs.readFileSync(footer, 'utf8')

// Footer has missing closing </div> for the brand div (from the 4-column grid)
// Fix: add </div> before <Separator /> and remove extra closing div at end
console.log('Checking Footer...')
const footerDivsOpen = (footerContent.match(/<div[^>]*>/g)||[]).filter(t => !t.endsWith('/>')).length
const footerDivsClose = (footerContent.match(/<\/div>/g)||[]).length
console.log(`div opens=${footerDivsOpen} closes=${footerDivsClose}`)

// The brand div (lg:col-span-1) is missing its closing </div>
// It's closed incorrectly at the bottom. Let me count the grid columns
// The grid has: Brand div (1), Shop (2), Help (3), Contact (4) - 4 children
// Then separator, then the copyright footer div

const footerCorrect = `import { Link } from 'react-router-dom'
import { Share2, Heart, Bookmark, Mail, Phone, MapPin } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="bg-foreground/90 backdrop-blur-md text-background mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img
              src="/Auraloom_white_logo.jpg"
              alt="AuraLoom"
              className="h-14 w-auto rounded-lg mb-4"
            />
            <p className="text-sm text-background/70 leading-relaxed mb-4">
              Curated fashion essentials — bags, jewellery, and clothes crafted for the modern Indian woman.
            </p>
            <div className="flex gap-3">
              <a href="#" className="size-9 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors">
                <Share2 className="size-4" />
              </a>
              <a href="#" className="size-9 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors">
                <Heart className="size-4" />
              </a>
              <a href="#" className="size-9 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors">
                <Bookmark className="size-4" />
              </a>
            </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/90">Shop</h3>
            <ul className="space-y-2.5 text-sm text-background/70">
              <li><Link to="/category/ladies-bags" className="hover:text-primary transition-colors">Ladies Bags</Link></li>
              <li><Link to="/category/artificial-jewellery" className="hover:text-primary transition-colors">Artificial Jewellery</Link></li>
              <li><Link to="/category/ladies-clothes" className="hover:text-primary transition-colors">Ladies Clothes</Link></li>
              <li><Link to="/new-arrivals" className="hover:text-primary transition-colors">New Arrivals</Link></li>
              <li><Link to="/offer-zone" className="hover:text-primary transition-colors">Offer Zone</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/90">Help</h3>
            <ul className="space-y-2.5 text-sm text-background/70">
              <li><Link to="/profile" className="hover:text-primary transition-colors">My Orders</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="hover:text-primary transition-colors">Return Policy</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/90">Contact Us</h3>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 mt-0.5 shrink-0 text-primary" />
                <span>Vinayak Enterprises, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" />
                <a href="tel:+91" className="hover:text-primary transition-colors">+91 8799764227</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary" />
                <a href="mailto:hello@auraloom.in" className="hover:text-primary transition-colors">hello@auraloom.in</a>
              </li>
            </ul>
          </div>

        <Separator className="my-8 bg-background/20" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/50">
          <p>&copy; {new Date().getFullYear()} AuraLoom by Vinayak Enterprises. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </div>
      </div>
    </footer>
  )
}
`

fs.writeFileSync(footer, footerCorrect, 'utf8')
console.log('  Rewrote Footer.tsx fresh')
verify(footer)

// ======== 3. FAQPage.tsx ========
console.log('\n=== FAQPage.tsx ===')
const faq = 'C:/Users/611626781/Downloads/AuraLoom/project/src/pages/FAQPage.tsx'
let faqContent = fs.readFileSync(faq, 'utf8')

const faqDivsOpen = (faqContent.match(/<div[^>]*>/g)||[]).filter(t => !t.endsWith('/>')).length
const faqDivsClose = (faqContent.match(/<\/div>/g)||[]).length
console.log(`div opens=${faqDivsOpen} closes=${faqDivsClose}`)

// FAQ page is missing </div> for the "space-y-10" div
// It has </div> close but the indentation is wrong
if (faqContent.includes('</div>\n      </div>\n    </Layout>')) {
  // Already has container closing, but the space-y-10 div is not closed
  const old = `          </div>
      </div>
    </Layout>`
  const new_ = `          </div>
      </div>
    </Layout>`

  if (faqContent.includes(old)) {
    faqContent = faqContent.replace(old, new_)
  } else {
    // Try simpler approach - add missing </div> before </div></Layout>
    // The structure should be: <Layout><div.container><div.space-y-10>...content...</div></Layout>
    // If space-y-10 is not closed, we need to add </div> before the last </div></Layout>
    // Actually looking at the file, it probably ends with:
    // </div>
    //       </div>
    //     </Layout>
    // Which means space-y-10 IS closed, container IS closed. But the alignment might be off
    console.log('Checking FAQ ending structure...')
    const endIdx = faqContent.lastIndexOf('</Layout>')
    const endPart = faqContent.substring(endIdx - 100)
    console.log(JSON.stringify(endPart))
  }
  fs.writeFileSync(faq, faqContent, 'utf8')
} else {
  console.log('FAQ already has proper closing structure')
}

verify(faq)

// ======== 4. ShippingPolicyPage.tsx ========
console.log('\n=== ShippingPolicyPage.tsx ===')
const shipping = 'C:/Users/611626781/Downloads/AuraLoom/project/src/pages/ShippingPolicyPage.tsx'
verify(shipping)

console.log('\n=== ALL DONE ===')
