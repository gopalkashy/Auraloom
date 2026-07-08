import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Star, Truck, Shield, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/shop/ProductCard'
import { Layout } from '@/components/layout/Layout'
import { supabase } from '@/lib/supabase'
import type { Category, Product } from '@/types'

const FASHION_QUOTES = [
  { text: 'Fashions fade, style is eternal.', author: 'Yves Saint Laurent' },
  { text: 'Style is a way to say who you are without having to speak.', author: 'Rachel Zoe' },
  { text: 'Elegance is not standing out, but being remembered.', author: 'Giorgio Armani' },
  { text: "The fashionable woman wears clothes. The clothes don't wear her.", author: 'Mary Quant' },
  { text: 'Simplicity is the keynote of all true elegance.', author: 'Coco Chanel' },
  { text: 'Grooming is the secret of real elegance.', author: 'Christian Dior' },
  { text: 'When in doubt, wear red.', author: 'Bill Blass' },
  { text: "Fashion is about dressing according to what's fashionable. Style is more about being yourself.", author: 'Oscar de la Renta' },
]

function TypewriterQuote() {
  const [index, setIndex] = React.useState(0)
  const [displayed, setDisplayed] = React.useState('')
  const [erasing, setErasing] = React.useState(false)

  React.useEffect(() => {
    const quote = FASHION_QUOTES[index].text

    if (!erasing) {
      if (displayed.length < quote.length) {
        const t = setTimeout(() => setDisplayed(quote.slice(0, displayed.length + 1)), 50)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setErasing(true), 2800)
        return () => clearTimeout(t)
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 28)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => {
          setIndex(i => (i + 1) % FASHION_QUOTES.length)
          setErasing(false)
        }, 450)
        return () => clearTimeout(t)
      }
    }
  }, [displayed, erasing, index])

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="text-center px-6 md:px-16 max-w-3xl w-full">
        <p className="text-lg md:text-3xl lg:text-4xl italic font-light text-white leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          &ldquo;{displayed}
          <span className="inline-block w-0.5 h-[0.9em] bg-white ml-1 align-left animate-pulse opacity-90" />
          &rdquo;
        </p>
        <p className="text-xl md:text-1xl lg:text-2xl xl:text-2xl font-semibold text-amber-300 mt-3 tracking-widest uppercase transition-all duration-500">
          — {FASHION_QUOTES[index].author}
        </p>
      </div>
    </div>
  )
}

const CATEGORY_IMAGES: Record<string, string> = {
  'ladies-bags': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
  'artificial-jewellery': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  'ladies-clothes': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
}

export function HomePage() {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [featured, setFeatured] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase
          .from('products')
          .select('*, subcategory:subcategories(*, category:categories(*))')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(8),
      ])
      setCategories(cats ?? [])
      setFeatured(prods ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <Layout>
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden">
        {/* Full-width banner image */}
        <div className="relative w-full">
          <img
            src="/designarena_image_3we0a7c0.webp"
            alt="AuraLoom — Elevate Your Style"
            className="w-full object-cover object-center"
            style={{ maxHeight: '520px', minHeight: '280px' }}
          />
          {/* Subtle gradient overlay at bottom for blending */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          {/* Side gradients for soft edge blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
          {/* Typewriter fashion quotes overlay */}
          <TypewriterQuote />
        </div>

        {/* CTA strip below banner */}
        <div className="relative bg-background/80 backdrop-blur-md border-b border-border/50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                    <Sparkles className="size-3 text-primary" />
                    New Collection {new Date().getFullYear()}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                  Elevate Your
                  <span className="text-primary"> Everyday Style</span>
                </h1>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Handpicked bags, jewellery & clothing for the modern Indian woman.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
                <Button size="lg" asChild className="gap-2 w-full sm:w-auto">
                  <Link to="/category/ladies-bags">
                    Shop Now <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                  <Link to="/category/artificial-jewellery">Explore Jewellery</Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-6 pt-6 border-t border-border/50">
              {[
                { value: '100+', label: 'Products' },
                { value: '1k+', label: 'Happy Customers' },
                { value: '4.5★', label: 'Rating' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-primary">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 border-y bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', sub: 'Orders above ₹999' },
              { icon: Shield, title: '100% Authentic', sub: 'Genuine products' },
              { icon: RefreshCw, title: 'Easy Returns', sub: '7-day return policy' },
              { icon: Star, title: 'Top Rated', sub: '4.9★ customer rating' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3">Shop by Category</Badge>
          <h2 className="text-3xl font-bold tracking-tight">Explore Our Collections</h2>
          <p className="text-muted-foreground mt-2 text-sm">Curated fashion for every occasion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))
            : categories.map(cat => (
                <Link key={cat.id} to={`/category/${cat.slug}`} className="group relative overflow-hidden rounded-2xl aspect-[4/3] block">
                  <img
                    src={cat.image_url || CATEGORY_IMAGES[cat.slug] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80'}
                    alt={cat.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-6">
                    <h3 className="text-white text-xl font-bold mb-1">{cat.name}</h3>
                    <p className="text-white/75 text-sm mb-3">{cat.description}</p>
                    <span className="inline-flex items-center gap-1.5 text-white text-sm font-medium group-hover:gap-3 transition-all">
                      Shop Now <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* Featured Products */}
      {(loading || featured.length > 0) && (
        <section className="container mx-auto px-4 py-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
              <p className="text-muted-foreground text-sm mt-1">Handpicked just for you</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/search?featured=true" className="gap-1.5">
                View All <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] rounded-xl" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        {/* Banner image background */}
        <div className="absolute inset-0">
          <img
            src="/designarena_image_3we0a7c0.webp"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-foreground/70 backdrop-blur-sm" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary-foreground border-primary/30">
            <Sparkles className="size-3 mr-1" /> Exclusive Collection
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-background">New Arrivals Every Week</h2>
          <p className="text-background/70 mb-8 max-w-md mx-auto">
            Follow us on Instagram for the latest styles and exclusive offers curated by AuraLoom.
          </p>
          <Button size="lg" asChild className="gap-2">
            <Link to="/category/ladies-clothes">Shop Latest Collection <ArrowRight className="size-4" /></Link>
          </Button>
        </div>
      </section>
    </Layout>
  )
}
