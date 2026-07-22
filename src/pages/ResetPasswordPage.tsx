import * as React from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, CheckCircle, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { validateResetToken, resetPassword as resetPasswordApi } from '@/lib/resetPassword'
import { toast } from 'sonner'

type Stage = 'validating' | 'invalid' | 'expired' | 'ready' | 'success'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [stage, setStage] = React.useState<Stage>('validating')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPwd, setShowPwd] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Validate the token when the page loads
  React.useEffect(() => {
    if (!token || !email) {
      setStage('invalid')
      return
    }

    const checkToken = async () => {
      const result = await validateResetToken(token, email)
      if (result.error) {
        setError(result.error)
        if (result.error.toLowerCase().includes('expired')) {
          setStage('expired')
        } else {
          setStage('invalid')
        }
      } else {
        setStage('ready')
      }
    }
    checkToken()
  }, [token, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) { toast.error('Please enter a new password'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }

    setLoading(true)
    const result = await resetPasswordApi(token, email, password)
    if (result.error) {
      toast.error(result.error)
    } else {
      setStage('success')
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 3000)
    }
    setLoading(false)
  }

  // ========== SUCCESS STAGE ==========
  if (stage === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="size-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Password reset successful!</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Your password has been updated. Redirecting you to sign in...
            </p>
          </div>
          <Button asChild className="w-full">
            <Link to="/login">
              <ArrowLeft className="size-4" /> Go to Sign In
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // ========== INVALID / EXPIRED STAGE ==========
  if (stage === 'invalid' || stage === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="size-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {stage === 'expired' ? 'Link expired' : 'Invalid link'}
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {error ?? 'This password reset link is invalid or has already been used.'}
            </p>
            <p className="text-muted-foreground text-xs mt-3">
              Please request a new password reset link.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link to="/forgot-password">
              <ArrowLeft className="size-4" /> Request New Link
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // ========== VALIDATING STAGE ==========
  if (stage === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="size-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Verifying your reset link...</p>
        </div>
      </div>
    )
  }

  // ========== RESET FORM STAGE ==========
  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-secondary to-accent/10 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/designarena_image_99wb2m6q.png')] bg-center bg-no-repeat bg-contain opacity-10" />
        <div className="relative text-center space-y-4 max-w-sm">
          <img src="/designarena_image_99wb2m6q.png" alt="AuraLoom" className="h-20 w-auto mx-auto" />
          <p className="text-lg font-medium text-foreground/80">
            Create a new password for your account
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
            <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your new password for <strong className="text-foreground">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="pl-9 pr-10"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <Lock className="size-4" />
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          <Separator />

          <p className="text-sm text-center text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Back to Sign In
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

