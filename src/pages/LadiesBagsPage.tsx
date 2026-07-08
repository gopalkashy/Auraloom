import { ShoppingBag, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CategoryPageLayout } from '@/components/shop/CategoryPageLayout'

export function LadiesBagsPage() {
  const hero = (
    <section className="bg-gradient-to-br from-rose-50 via-background to-pink-50 border-b">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="size-7 text-rose-600" />
          </div>
          <div>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 mb-2">
              <Sparkles className="size-3 text-rose-600" />
              Handpicked Collection
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ladies Bags</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Stylish and elegant bags for every occasion — from everyday totes to evening clutches
            </p>
          </div>
        </div>
      </div>
    </section>
  )

  return <CategoryPageLayout categorySlug="ladies-bags" heroSection={hero} />
}
