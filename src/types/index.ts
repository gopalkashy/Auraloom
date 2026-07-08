export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  category?: Category
}

export interface Product {
  id: string
  subcategory_id: string
  name: string
  slug: string
  description: string | null
  price: number
  sale_price: number | null
  discount_percentage: number
  stock_qty: number
  sku: string | null
  images: string[]
  is_active: boolean
  is_featured: boolean
  tags: string[]
  created_at: string
  updated_at: string
  subcategory?: Subcategory & { category?: Category }
}

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  pincode: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  subtotal: number
  discount: number
  shipping_cost: number
  total: number
  shipping_name: string | null
  shipping_phone: string | null
  shipping_address: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_pincode: string | null
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image: string | null
  quantity: number
  price: number
  subtotal: number
  created_at: string
  product?: Product
}

export interface CartState {
  items: LocalCartItem[]
  total: number
  itemCount: number
}

export interface LocalCartItem {
  product: Product
  quantity: number
}
