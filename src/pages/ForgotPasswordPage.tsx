import * as React from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { requestPasswordReset } from '@/lib/resetPassword'

export function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [resetLink, setResetLink] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email address'); return }
    setLoading(true)
    const { error, resetLink: link, message } = await requestPasswordReset(email)
    if (error) {
      toast.error(error)
    } else {
      setSent(true)
      setResetLink(link)
      if (link) {
        toast.success('Reset link generated!')
      } else {
        toast.success(message ?? 'If the email is registered, a reset link has been sent.')
      }
    }
    setLoading(false)
  }

  const copyLink = () => {
    if (resetLink) {
      navigator.clipboard.writeText(resetLink)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (sent) {
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

        {/* Right panel — success message */}
        <div className="flex-1 flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-sm text-center space-y-6">
            <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="size-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="text-muted-foreground text-sm mt-2">
                We've sent a password reset link to <strong className="text-foreground">{email}</strong>
              </p>

              {/* Show the reset link directly on screen (dev mode without email service) */}
              {resetLink && (
                <div className="mt-4 p-3 bg-secondary/80 rounded-lg border text-left">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    🔗 Dev Mode — Your Reset Link (copy & open in new tab)
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-foreground break-all flex-1 bg-background/50 p-2 rounded border">
                      {resetLink}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyLink}
                      className="shrink-0 gap-1"
                    >
                      <Copy className="size-3.5" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <a
                    href={resetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                  >
                    <ExternalLink className="size-3" /> Open reset link
                  </a>
                </div>
              )}

              <p className="text-muted-foreground text-xs mt-3">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-primary hover:underline font-medium inline"
                >
                  try again
                </button>
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link to="/login">
                  <ArrowLeft className="size-4" /> Back to Sign In
                </Link>
              </Button>
            </div>
          </div>
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
            Reset your password and get back to shopping
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
            <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
            <p className="text-muted-foreground text-sm mt-1">
              No worries! Enter your email and we'll send you a reset link.
            </p>
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

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

