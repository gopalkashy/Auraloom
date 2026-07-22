
import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword, isPasswordRecovery, user } = useAuth()
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPwd, setShowPwd] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const hasRecoveryAccess = isPasswordRecovery && user

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!password) { toast.error('Please enter a new password'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    setLoading(true)
    const { error } = await updatePassword(password)
    if (error) { toast.error(error) } else { setSuccess(true); toast.success('Password reset successfully!'); setTimeout(() => navigate('/login'), 3000) }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mx-auto"><CheckCircle className="size-10 text-green-600" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Password reset successful!</h1><p className="text-muted-foreground text-sm mt-2">Your password has been updated. Redirecting you to sign in...</p></div>
          <Button asChild className="w-full"><Link to="/login"><ArrowLeft className="size-4" /> Go to Sign In</Link></Button>
        </div>
      </div>
    )
  }

  if (!hasRecoveryAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto"><AlertCircle className="size-10 text-destructive" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Invalid or expired link</h1><p className="text-muted-foreground text-sm mt-2">This password reset link is invalid or has expired. Please request a new one.</p></div>
          <Button asChild className="w-full"><Link to="/forgot-password"><ArrowLeft className="size-4" /> Request New Link</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-secondary to-accent/10 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/designarena_image_99wb2m6q.png')] bg-center bg-no-repeat bg-contain opacity-10" />
        <div className="relative text-center space-y-4 max-w-sm">
          <img src="/designarena_image_99wb2m6q.png" alt="AuraLoom" className="h-20 w-auto mx-auto" />
          <p className="text-lg font-medium text-foreground/80">Create a new password for your account</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden text-center mb-4"><Link to="/"><img src="/designarena_image_99wb2m6q.png" alt="AuraLoom" className="h-12 w-auto mx-auto" /></Link></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Reset password</h1><p className="text-muted-foreground text-sm mt-1">Enter your new password for <strong className="text-foreground">{user?.email}</strong></p></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="password" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required className="pl-9 pr-10" />
                <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Repeat your new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}><Lock className="size-4" /> {loading ? 'Resetting...' : 'Reset Password'}</Button>
          </form>
          <Separator />
          <p className="text-sm text-center text-muted-foreground">Remember your password? <Link to="/login" className="text-primary hover:underline font-medium">Back to Sign In</Link></p>
          <p className="text-xs text-center text-muted-foreground"><Link to="/" className="hover:text-primary">{'<'} Back to shopping</Link></p>
        </div>
      </div>
    </div>
  )
}