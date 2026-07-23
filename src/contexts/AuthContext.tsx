import * as React from 'react'
import { supabase, getSiteUrl } from '@/lib/supabase'
import type { Profile } from '@/types'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  sendPasswordResetEmail: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
  isPasswordRecovery: boolean
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = React.useState(false)

  const fetchProfile = React.useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    // Profile might not exist yet if trigger hasn't fired — create it as fallback
    if (!data) {
      const { data: userData } = await supabase.auth.getUser()
      const fullName = userData?.user?.user_metadata?.full_name ?? null
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: fullName,
      })
      const { data: retry } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      setProfile(retry)
    } else {
      setProfile(data)
    }
  }, [])

  React.useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) await fetchProfile(session.user.id)
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Track when user arrives from password recovery email
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      } else {
        setIsPasswordRecovery(false)
      }

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const siteUrl = getSiteUrl()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${siteUrl}/verify-email?type=signup`,
      },
    })
    if (error) return { error: error.message }

    // If email confirmation is required, there's no session
    if (!data.session) {
      return { error: 'CONFIRM_EMAIL' as const }
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  const sendPasswordResetEmail = async (email: string) => {
    const siteUrl = getSiteUrl()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    })
    return { error: error?.message ?? null }
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error: error?.message ?? null }
  }

  const isAdmin = profile?.is_admin === true

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading, isAdmin,
      signIn, signUp, signOut, refreshProfile,
      sendPasswordResetEmail, updatePassword, isPasswordRecovery,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
