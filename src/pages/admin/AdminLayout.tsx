import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, ShoppingCart, LogOut, Home, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import * as React from 'react'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
]

function NavLinks({ onClick }: { onClick?: () => void }) {
  const location = useLocation()
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
        const active = exact ? location.pathname === to : location.pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full py-4 px-3">
      <div className="mb-6 px-1">
        <img src="/AuraLoom_Logo.png" alt="AuraLoom" className="w-full h-16 object-fill" />
        <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">Admin Panel</p>
      </div>

      <NavLinks onClick={() => setMobileOpen(false)} />

      <div className="mt-auto pt-4 space-y-1">
        <Separator className="mb-3" />
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Home className="size-4" /> View Store
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="size-4" /> Sign Out
        </button>
        <p className="text-xs text-muted-foreground px-3 pt-2 truncate">{profile?.full_name ?? 'Admin'}</p>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r bg-sidebar flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center gap-3 px-4 h-14 border-b bg-background/95 backdrop-blur-sm">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu className="size-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0 bg-sidebar">
            {sidebarContent}
          </SheetContent>
        </Sheet>
        <img src="/AuraLoom_Logo.png" alt="AuraLoom Admin" className="h-8 w-auto" />
      </div>

      {/* Main content */}
      <main className="flex-1 md:pt-0 pt-14 min-w-0">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
