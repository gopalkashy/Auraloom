import * as React from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAuth()
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email address'); return }
    setLoading(true)

    const { data: exists, error: rpcError } = await supabase.rpc('check_email_exists', { p_email: email })
    if (rpcError) {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
      return
    }
    if (!exists) {
      toast.error('This email address is not registered with AuraLoom.')
      setLoading(false)
      return
    }

    const { error } = await sendPasswordResetEmail(email)
    if (error) {
      toast.error(error)
    } else {
      setSent(true)
      toast.success('Reset link sent! Check your email inbox.')
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-secondary to-accent/10 items-center justify-center p-12 relative overflow-hidden">
          <div className="relative text-center space-y-4 max-w-sm">
            <img src="/AuraLoom_Logo.png" alt="AuraLoom" className="h-28 w-auto mx-auto" />
            <p className="text-lg font-medium text-foreground/80">Your style destination for bags, jewellery and fashion</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-sm text-center space-y-6">
            <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="size-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="text-muted-foreground text-sm mt-2">
                We sent a password reset link to <strong className="text-foreground">{email}</strong>
              </p>
              <p className="text-muted-foreground text-xs mt-3">
                Didn't receive the email? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="text-primary hover:underline font-medium inline">
                  try again
                </button>
              </p>
            </div>
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link to="/login"><ArrowLeft className="size-4" /> Back to Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-secondary to-accent/10 items-center justify-center p-12 relative overflow-hidden">
        <div className="relative text-center space-y-4 max-w-sm">
          <img src="/AuraLoom_Logo.png" alt="AuraLoom" className="h-28 w-auto mx-auto" />
          <p className="text-lg font-medium text-foreground/80">Reset your password and get back to shopping</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden text-center mb-4">
            <Link to="/"><img src="/AuraLoom_Logo.png" alt="AuraLoom" className="h-16 w-auto mx-auto" /></Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter your registered email and we'll send you a reset link.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <Send className="size-4" />
              {loading ? 'Checking...' : 'Send Reset Link'}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Back to Sign In</Link>
          </p>
          <p className="text-xs text-center text-muted-foreground">
            <Link to="/" className="hover:text-primary">← Back to shopping</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
