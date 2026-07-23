import * as React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const { signUp, user } = useAuth()
  const [form, setForm] = React.useState({ fullName: '', email: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (user) navigate(redirect, { replace: true })
  }, [user, navigate, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password) { toast.error('Please fill in all fields'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.fullName)
    if (error === 'CONFIRM_EMAIL') {
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}&redirect=${encodeURIComponent(redirect)}`, { replace: true })
    } else if (error) {
      toast.error(error)
    } else {
      toast.success('Account created! Welcome to AuraLoom.')
      navigate(redirect, { replace: true })
    }
    setLoading(false)
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-secondary to-accent/10 items-center justify-center p-12 relative overflow-hidden">
        <div className="relative text-center space-y-4 max-w-sm">
          <img src="/AuraLoom_Logo.png" alt="AuraLoom" className="h-28 w-auto mx-auto" />
          <p className="text-lg font-medium text-foreground/80">
            Join thousands of happy shoppers at AuraLoom
          </p>
          <div className="flex justify-center gap-8 pt-4">
            {['Free Shipping', 'Easy Returns', 'COD Available'].map(t => (
              <div key={t} className="text-center">
                <p className="text-xs font-medium text-foreground/70">✓ {t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden text-center mb-4">
            <Link to="/"><img src="/AuraLoom_Logo.png" alt="AuraLoom" className="h-16 w-auto mx-auto" /></Link>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
            <p className="text-muted-foreground text-sm mt-1">Start shopping with AuraLoom today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <UserPlus className="size-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <Separator />

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-primary hover:underline font-medium">
              Sign in
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
