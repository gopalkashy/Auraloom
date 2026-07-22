import { Link } from 'react-router-dom'
import { HelpCircle, ChevronRight } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Layout } from '@/components/layout/Layout'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const FAQ_CATEGORIES = [
  {
    title: 'Orders & Payments',
    items: [
      { q: 'How do I place an order?', a: 'Simply browse our categories, add items to your cart, and proceed to checkout. You can place an order as a guest or create an account for a faster experience next time.' },
      { q: 'What payment methods do you accept?', a: 'We accept Credit/Debit Cards, UPI (GPay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) for orders up to ₹10,000.' },
      { q: 'Is COD (Cash on Delivery) available?', a: 'Yes, COD is available on orders up to ₹10,000. A nominal convenience fee of ₹49 applies to all COD orders.' },
      { q: 'Can I cancel my order?', a: 'Orders can be cancelled within 2 hours of placing them, free of charge. Once shipped, cancellations are not possible - you can initiate a return instead.' },
      { q: 'Will I get a invoice for my order?', a: 'Yes, a GST invoice is included with every order. You can also download it from your account under My Orders.' },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 3-8 business days depending on your location. Metro cities receive faster delivery (3-5 days), while remote areas may take 5-8 days.' },
      { q: 'Do you offer free shipping?', a: 'Yes, we offer free shipping on all orders above ₹999. Orders below ₹999 are charged a flat ₹99 shipping fee.' },
      { q: 'Do you ship internationally?', a: 'Currently, we only ship within India. We do not offer international shipping at this time.' },
      { q: 'How can I track my order?', a: 'You can track your order from your account dashboard under "My Orders". A tracking link is also sent to your email and phone once the order is dispatched.' },
      { q: 'What if I miss the delivery attempt?', a: 'The courier will make up to 3 delivery attempts before returning the package. You can also contact the courier directly using the tracking number to reschedule.' },
    ],
  },
  {
    title: 'Returns & Exchanges',
    items: [
      { q: 'What is your return policy?', a: 'We offer a 7-day return window from the date of delivery. Items must be unused, with original tags and packaging. See our detailed Return Policy page for more information.' },
      { q: 'How do I initiate a return?', a: 'Log in to your account, go to My Orders, select the order and click "Request Return". You can also email us at hello@auraloom.in with your order number.' },
      { q: 'How long do refunds take?', a: 'Refunds are processed within 5-7 business days (prepaid orders) or 7-10 business days (COD orders) after the returned item is received at our warehouse.' },
      { q: 'Can I exchange an item?', a: 'Yes, size exchanges and product exchanges are available subject to stock availability. The replacement is shipped within 2-3 business days after we receive the returned item.' },
      { q: 'What items cannot be returned?', a: 'Earrings, innerwear, swimwear, customized items, and items marked as "Final Sale" cannot be returned for hygiene and safety reasons.' },
    ],
  },
  {
    title: 'Products & Sizing',
    items: [
      { q: 'How do I find the right size?', a: 'Each product page includes a size guide. If you are unsure, feel free to contact us with your measurements and we will help you choose the perfect fit.' },
      { q: 'Are your products authentic?', a: 'Absolutely! We source all our products directly from trusted manufacturers and verified suppliers. Every item is quality-checked before shipping.' },
      { q: 'Do you have a physical store?', a: 'AuraLoom is currently an online-only brand. You can shop from our website and we deliver to your doorstep.' },
      { q: 'Can I get a product customized?', a: 'Currently, we do not offer customization services. However, we regularly update our collection with new designs and styles.' },
    ],
  },
  {
    title: 'Account & Support',
    items: [
      { q: 'How do I create an account?', a: 'Click on "Register" in the top navigation bar, enter your details, and you are all set! It takes less than a minute.' },
      { q: 'I forgot my password. What should I do?', a: 'Click on "Forgot Password" on the login page, enter your email, and we will send you a password reset link.' },
      { q: 'How can I contact customer support?', a: 'You can reach us via email at hello@auraloom.in or call us at +91 8799764227. We are available Monday to Saturday, 10:00 AM to 7:00 PM IST.' },
      { q: 'How do I update my profile or address?', a: 'Log in to your account and go to the "Account Details" tab. You can update your name, phone number, and shipping address there.' },
    ],
  },
]

export function FAQPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">FAQ</span>
        </nav>
        <div className="space-y-10">
          <div className="text-center space-y-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <HelpCircle className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Find answers to common questions about ordering, shipping, returns, and more.
            </p>
          </div>
          <Separator />
          <div className="space-y-8">
            {FAQ_CATEGORIES.map((category, ci) => (
              <section key={ci}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary" />
                  {category.title}
                </h2>
                <Accordion type="single" collapsible className="border rounded-xl divide-y">
                  {category.items.map((item, ii) => (
                    <AccordionItem key={ii} value={`${ci}-${ii}`}>
                      <AccordionTrigger className="px-4 py-3.5 text-sm font-medium hover:no-underline hover:bg-secondary/30 transition-colors text-left">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
          <Separator />
          <div className="bg-secondary/50 rounded-xl p-8 text-center space-y-3">
            <h2 className="text-lg font-semibold">Still have questions?</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Our support team is here to help. Reach out to us and we will get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a href="mailto:hello@auraloom.in" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Email Us</a>
              <a href="tel:+918799764227" className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">Call +91 8799764227</a>
            </div>
            <p className="text-xs text-muted-foreground">
              This FAQ was last updated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
            </p>
          </div>
</div>
      </div>
    </Layout>
  )
}
