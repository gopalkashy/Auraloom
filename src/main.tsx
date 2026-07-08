import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { Toaster } from '@/components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="auraloom-theme">
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster richColors position="top-right" duration={5000} closeButton />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
