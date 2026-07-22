import * as React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingBag, Search, User, Menu, X, ChevronDown, LogOut, Settings, Package, Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const NAV_CATEGORIES = [
  { label: 'Ladies Bags', slug: 'ladies-bags' },
  { label: 'Artificial Jewellery', slug: 'artificial-jewellery' },
  { label: 'Ladies Clothes', slug: 'ladies-clothes' },
]

const SPECIAL_PAGES = [
  { label: 'New Arrivals', path: '/new-arrivals' },
  { label: 'Offer Zone', path: '/offer-zone' },
]

export function Header() {
  const { itemCount } = useCart()
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      {/* Top announcement bar */}
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-medium tracking-wide">
        Free shipping on orders above ₹999 &nbsp;•&nbsp; COD Available
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Link to="/" onClick={() => setMobileOpen(false)}>
                    <img src="/Auraloom_white_logo.png" alt="AuraLoom" className="w-32 h-auto" />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                <Link
                  to="/"
                  className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
                {NAV_CATEGORIES.map(cat => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {cat.label}
                  </Link>
                ))}
                {SPECIAL_PAGES.map(page => (
                  <Link
                    key={page.path}
                    to={page.path}
                    className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {page.label}
                  </Link>
                ))}
                <div className="mt-4 pt-4 border-t flex flex-col gap-1">
                  {user ? (
                    <>
                      <Link to="/profile?tab=orders" className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-secondary" onClick={() => setMobileOpen(false)}>My Orders</Link>
                      <Link to="/wishlist" className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-secondary" onClick={() => setMobileOpen(false)}>Wishlist</Link>
                      {isAdmin && <Link to="/admin" className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-secondary" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
                      <button onClick={() => { handleSignOut(); setMobileOpen(false) }} className="px-3 py-2.5 rounded-md text-sm font-medium text-left hover:bg-secondary text-destructive">Sign Out</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-secondary" onClick={() => setMobileOpen(false)}>Login</Link>
                      <Link to="/register" className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-secondary" onClick={() => setMobileOpen(false)}>Register</Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src="/Auraloom_white_logo.png" alt="AuraLoom" className="w-36 h-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary',
                location.pathname === '/' ? 'text-primary' : 'text-foreground/70'
              )}
            >
              Home
            </Link>
            {NAV_CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary',
                  location.pathname.startsWith(`/category/${cat.slug}`) ? 'text-primary' : 'text-foreground/70'
                )}
              >
                {cat.label}
              </Link>
            ))}
            {SPECIAL_PAGES.map(page => (
              <Link
                key={page.path}
                to={page.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === page.path ? 'text-primary' : 'text-foreground/70'
                )}
              >
                {page.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="h-8 w-40 md:w-56"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                  <X className="size-4" />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                <Search className="size-5" />
              </Button>
            )}

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/wishlist">
                <Heart className="size-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart">
                <ShoppingBag className="size-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center text-[10px] font-bold">
                    {itemCount > 99 ? '99+' : itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 hidden md:flex">
                    <User className="size-4" />
                    <span className="text-sm max-w-24 truncate">
                      {profile?.full_name?.split(' ')[0] ?? 'Account'}
                    </span>
                    <ChevronDown className="size-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile?tab=orders" className="flex items-center gap-2">
                      <Package className="size-4" /> My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile?tab=account" className="flex items-center gap-2">
                      <Settings className="size-4" /> Account Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 text-primary">
                          <Settings className="size-4" /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive gap-2">
                    <LogOut className="size-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
