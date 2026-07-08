import { Gem, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CategoryPageLayout } from '@/components/shop/CategoryPageLayout'

export function ArtificialJewelleryPage() {
  const hero = (
    <section className="bg-gradient-to-br from-amber-50 via-background to-yellow-50 border-b">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Gem className="size-7 text-amber-600" />
          </div>
          <div>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 mb-2">
              <Sparkles className="size-3 text-amber-600" />
              Handcrafted Pieces
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Artificial Jewellery</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Beautiful handcrafted artificial jewellery — earrings, necklaces, bangles and more
            </p>
          </div>
        </div>
      </div>
    </section>
  )

  return <CategoryPageLayout categorySlug="artificial-jewellery" heroSection={hero} />
}
