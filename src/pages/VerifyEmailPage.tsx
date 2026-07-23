import * as React from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Mail, ShieldCheck, CheckCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const email = searchParams.get('email') ?? ''
  const redirect = searchParams.get('redirect') ?? '/'
  const tokenHash = searchParams.get('token_hash') ?? ''
  const type = (searchParams.get('type') ?? 'signup') as 'signup' | 'email'

  const [loading, setLoading] = React.useState(false)
  const [resending, setResending] = React.useState(false)
  const [verified, setVerified] = React.useState(false)

  // Auto-verify when user clicks the email link
  React.useEffect(() => {
    if (!tokenHash) return
    const verify = async () => {
      setLoading(true)
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      if (error) {
        toast.error('Verification link is invalid or expired. Please request a new one.')
      } else {
        setVerified(true)
        toast.success('Email verified! Welcome to AuraLoom 🎉')
        setTimeout(() => navigate(redirect, { replace: true }), 1500)
      }
      setLoading(false)
    }
    verify()
  }, [tokenHash, type, redirect, navigate])

  // Redirect if nothing to work with
  React.useEffect(() => {
    if (!email && !tokenHash) navigate('/register', { replace: true })
  }, [email, tokenHash, navigate])

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) toast.error('Failed to resend. Please try again.')
    else toast.success('Verification email resent!')
    setResending(false)
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="size-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Email Verified!</h1>
          <p className="text-muted-foreground text-sm">Redirecting you now...</p>
        </div>
      </div>
    )
  }

  if (tokenHash && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <ShieldCheck className="size-8 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Verifying your email...</h1>
          <p className="text-muted-foreground text-sm">Please wait a moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-secondary to-accent/10 items-center justify-center p-12">
        <div className="text-center space-y-4 max-w-sm">
          <img src="/AuraLoom_Logo.png" alt="AuraLoom" className="h-28 w-auto mx-auto" />
          <p className="text-lg font-medium text-foreground/80">One step away from joining AuraLoom</p>
          <div className="flex justify-center gap-8 pt-4">
            {['Free Shipping', 'Easy Returns', 'COD Available'].map(t => (
              <p key={t} className="text-xs font-medium text-foreground/70">✓ {t}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="lg:hidden mb-4">
            <Link to="/"><img src="/AuraLoom_Logo.png" alt="AuraLoom" className="h-16 w-auto mx-auto" /></Link>
          </div>

          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Mail className="size-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground text-sm">We sent a verification link to</p>
            <p className="font-semibold text-foreground">{email}</p>
            <p className="text-sm text-muted-foreground pt-1">
              Click the link in the email to verify your account.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive it?{' '}
              <button
                onClick={handleResend}
                disabled={resending || !email}
                className="text-primary hover:underline font-medium disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend email'}
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              <Link to="/register" className="hover:text-primary inline-flex items-center gap-1">
                <ArrowLeft className="size-3" /> Back to Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
