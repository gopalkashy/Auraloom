import * as React from 'react'
import type { LocalCartItem, Product } from '@/types'

interface CartContextValue {
  items: LocalCartItem[]
  itemCount: number
  total: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  getQuantity: (productId: string) => number
}

const CartContext = React.createContext<CartContextValue | undefined>(undefined)

const CART_KEY = 'auraloom_cart'

function loadCart(): LocalCartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveCart(items: LocalCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<LocalCartItem[]>(loadCart)

  React.useEffect(() => {
    saveCart(items)
  }, [items])

  const addItem = React.useCallback((product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock_qty) }
            : i
        )
      }
      return [...prev, { product, quantity }]
    })
  }, [])

  const removeItem = React.useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }, [])

  const updateQuantity = React.useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId))
      return
    }
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    )
  }, [])

  const clearCart = React.useCallback(() => setItems([]), [])

  const isInCart = React.useCallback((productId: string) =>
    items.some(i => i.product.id === productId), [items])

  const getQuantity = React.useCallback((productId: string) =>
    items.find(i => i.product.id === productId)?.quantity ?? 0, [items])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const total = items.reduce((sum, i) => {
    const price = i.product.sale_price ?? i.product.price
    return sum + price * i.quantity
  }, 0)

  return (
    <CartContext.Provider value={{ items, itemCount, total, addItem, removeItem, updateQuantity, clearCart, isInCart, getQuantity }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
