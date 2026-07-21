import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, Lock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { isPasswordRecovery, updatePassword, user } = useAuth()
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPwd, setShowPwd] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  // If there's no recovery session and user is not in recovery mode, redirect to forgot-password
  React.useEffect(() => {
    if (!user && !isPasswordRecovery) {
      // Give time for the auth state to propagate from the email link
      const timer = setTimeout(() => {
        navigate('/forgot-password', { replace: true })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [user, isPasswordRecovery, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) { toast.error('Please enter a new password'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    setLoading(true)
    const { error } = await updatePassword(password)
    if (error) {
      toast.error(error)
    } else {
      setSuccess(true)
      toast.success('Password updated successfully!')
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    }
    setLoading(false)
  }

  // Show loading while auth state is being detected from the email link
  if (!user && !isPasswordRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4">
          <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto animate-pulse">
            <Lock className="size-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Verifying your request...</h1>
          <p className="text-muted-foreground text-sm">Please wait while we process your password reset link.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="size-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Password updated!</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Your password has been successfully reset. Redirecting you to sign in...
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
            Go to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-secondary to-accent/10 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/designarena_image_99wb2m6q.png')] bg-center bg-no-repeat bg-contain opacity-10" />
        <div className="relative text-center space-y-4 max-w-sm">
          <img src="/designarena_image_99wb2m6q.png" alt="AuraLoom" className="h-20 w-auto mx-auto" />
          <p className="text-lg font-medium text-foreground/80">
            Choose a strong password to keep your account secure
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <Lock className="size-4" />
              {loading ? 'Updating...' : 'Reset Password'}
            </Button>
          </form>

          <Separator />

          <p className="text-xs text-center text-muted-foreground">
            <a href="/login" className="hover:text-primary">← Back to Sign In</a>
          </p>
        </div>
      </div>
    </div>
  )
}

