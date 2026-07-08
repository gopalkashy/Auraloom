import { Shirt, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CategoryPageLayout } from '@/components/shop/CategoryPageLayout'

export function LadiesClothesPage() {
  const hero = (
    <section className="bg-gradient-to-br from-violet-50 via-background to-purple-50 border-b">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Shirt className="size-7 text-violet-600" />
          </div>
          <div>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 mb-2">
              <Sparkles className="size-3 text-violet-600" />
              Trendy Styles
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ladies Clothes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Trendy and elegant ladies fashion — from casual wear to festive outfits
            </p>
          </div>
        </div>
      </div>
    </section>
  )

  return <CategoryPageLayout categorySlug="ladies-clothes" heroSection={hero} />
}
