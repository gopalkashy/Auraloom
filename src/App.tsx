import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { HomePage } from '@/pages/HomePage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NewArrivalsPage } from '@/pages/NewArrivalsPage'
import { OfferZonePage } from '@/pages/OfferZonePage'
import { LadiesBagsPage } from '@/pages/LadiesBagsPage'
import { ArtificialJewelleryPage } from '@/pages/ArtificialJewelleryPage'
import { LadiesClothesPage } from '@/pages/LadiesClothesPage'
import { SearchPage } from '@/pages/SearchPage'
import { WishlistPage } from '@/pages/WishlistPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/VerifyEmailPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminCategories } from '@/pages/admin/AdminCategories'
import { AdminProducts } from '@/pages/admin/AdminProducts'
import { AdminOrders } from '@/pages/admin/AdminOrders'
import { AdminOrderDetail } from '@/pages/admin/AdminOrderDetail'

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!user || !isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/category/ladies-bags" element={<LadiesBagsPage />} />
        <Route path="/category/artificial-jewellery" element={<ArtificialJewelleryPage />} />
        <Route path="/category/ladies-clothes" element={<LadiesClothesPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/new-arrivals" element={<NewArrivalsPage />} />
        <Route path="/offer-zone" element={<OfferZonePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Auth-required routes */}
        <Route path="/checkout" element={<AuthRoute><CheckoutPage /></AuthRoute>} />
        <Route path="/order-confirmation/:orderId" element={<AuthRoute><OrderConfirmationPage /></AuthRoute>} />
        <Route path="/profile" element={<AuthRoute><ProfilePage /></AuthRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/orders/:orderId" element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
