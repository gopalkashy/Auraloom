import * as React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const { signIn, user } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPwd, setShowPwd] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (user) navigate(redirect, { replace: true })
  }, [user, navigate, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error(error === 'Invalid login credentials' ? 'Invalid email or password' : error)
    } else {
      toast.success('Welcome back!')
      navigate(redirect, { replace: true })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-secondary to-accent/10 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/designarena_image_99wb2m6q.png')] bg-center bg-no-repeat bg-contain opacity-10" />
        <div className="relative text-center space-y-4 max-w-sm">
          <img src="/designarena_image_99wb2m6q.png" alt="AuraLoom" className="h-20 w-auto mx-auto" />
          <p className="text-lg font-medium text-foreground/80">
            Your style destination for bags, jewellery & fashion
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden text-center mb-4">
            <Link to="/">
              <img src="/designarena_image_99wb2m6q.png" alt="AuraLoom" className="h-12 w-auto mx-auto" />
            </Link>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your AuraLoom account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <LogIn className="size-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Separator />

          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link to={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>

          <p className="text-xs text-center text-muted-foreground">
            <Link to="/" className="hover:text-primary">← Back to shopping</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
