import fs from 'fs'

// === Fix ReturnPolicyPage.tsx ===
const rtn = 'C:/Users/611626781/Downloads/AuraLoom/project/src/pages/ReturnPolicyPage.tsx'
let c = fs.readFileSync(rtn, 'utf8')

// Fix 1: Section 2 - add missing </div> for pl-13 div
// The pattern is: amber div, then directly </section> (missing </div>)
const fix1 = 'rounded-xl p-4 mt-3">\n                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">Tip: Please try on your items carefully. For clothing, we recommend trying over your own clothes to avoid soiling.</p>\n              </div>\n          </section>'
const fix1result = 'rounded-xl p-4 mt-3">\n                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">Tip: Please try on your items carefully. For clothing, we recommend trying over your own clothes to avoid soiling.</p>\n              </div>\n            </div>\n          </section>'

c = c.replace(fix1, fix1result)

// Fix 2: End of file - add missing </div> for container div
// Pattern: </p>\n        </div>\n    </Layout>
c = c.replace('</p>\n        </div>\n    </Layout>', '</p>\n        </div>\n      </div>\n    </Layout>')

fs.writeFileSync(rtn, c, 'utf8')

// Verify
const divOpens = (c.match(/<div[^>]*>/g)||[]).filter(t => !t.endsWith('/>')).length
const divCloses = (c.match(/<\/div>/g)||[]).length
console.log(`ReturnPolicyPage: div ${divOpens}/${divCloses} ${divOpens===divCloses?'OK':'FAIL'}`)

// === Fix Footer.tsx ===
const footer = 'C:/Users/611626781/Downloads/AuraLoom/project/src/components/layout/Footer.tsx'
let f = fs.readFileSync(footer, 'utf8')

// Footer is missing closing </div> for the grid's children divs
// The structure should be: <div.grid> <div.brand>..</div> <div.shop>..</div> <div.help>..</div> <div.contact>..</div> <Separator/> <div.copyright>..</div> </div.container> </footer>
// Currently the brand div is not closed, and the contact div is not started (its content is in the wrong place)

// Actually looking at the file again more carefully - the structure is wrong due to the earlier corruption
// Let me just rewrite the footer completely
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

// Verify Footer
const fc = fs.readFileSync(footer, 'utf8')
const fOpens = (fc.match(/<div[^>]*>/g)||[]).filter(t => !t.endsWith('/>')).length
const fCloses = (fc.match(/<\/div>/g)||[]).length
const fLayoutO = (fc.match(/<footer>/g)||[]).length
const fLayoutC = (fc.match(/<\/footer>/g)||[]).length
console.log(`Footer: div ${fOpens}/${fCloses} ${fOpens===fCloses?'OK':'FAIL'} | footer ${fLayoutO}/${fLayoutC}`)

console.log('\nDone!')
