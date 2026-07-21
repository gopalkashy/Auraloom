import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-secondary to-accent/10 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/designarena_image_99wb2m6q.png')] bg-center bg-no-repeat bg-contain opacity-10" />
        <div className="relative text-center space-y-4 max-w-sm">
          <img src="/designarena_image_99wb2m6q.png" alt="AuraLoom" className="h-20 w-auto mx-auto" />
          <p className="text-lg font-medium text-foreground/80">
            Confirm your email to start shopping with AuraLoom
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
            <h1 className="text-2xl font-bold tracking-tight">Email verified!</h1>
            <p className="text-muted-foreground text-sm mt-2">
              {email ? (
                <>
                  Your email <strong className="text-foreground">{email}</strong> has been successfully verified.
                </>
              ) : (
                'Your email has been successfully verified.'
              )}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              You can now sign in to your account and start shopping.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button className="w-full gap-2" asChild>
              <Link to="/login">
                Sign In to Your Account
              </Link>
            </Button>
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link to="/">
                <ArrowLeft className="size-4" /> Back to Shopping
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="size-3.5" />
              <span>
                Didn't get the email?{' '}
                <button
                  onClick={async () => {
                    // Can trigger resend if we have the email
                    if (email) {
                      // User can go back to register or contact support
                    }
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Contact support
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

