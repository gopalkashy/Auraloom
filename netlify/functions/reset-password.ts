import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Initialize Supabase Admin client (service_role bypasses RLS)
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const siteUrl = process.env.VITE_SITE_URL ?? process.env.URL ?? 'http://localhost:5173'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ResetRequestBody {
  action: 'send' | 'validate' | 'reset'
  email?: string
  token?: string
  password?: string
}

export const handler = async (event: { httpMethod: string; body: string }) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const body: ResetRequestBody = JSON.parse(event.body)

    // ========== SEND: Generate token & store in DB ==========
    if (body.action === 'send') {
      const { email } = body
      if (!email) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) }
      }

      // Check if user exists in auth.users
      const { data: users, error: userError } = await supabase.auth.admin.listUsers()
      if (userError) throw userError

      const userExists = users.users.find(u => u.email === email)
      if (!userExists) {
        // Return success anyway to not reveal if email exists (security)
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'If the email is registered, a reset link has been generated.',
            resetLink: null, // No link for non-existent users
          }),
        }
      }

      // Generate secure random token
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour expiry

      // Store token in database
      const { error: insertError } = await supabase
        .from('password_reset_tokens')
        .insert({ email, token, expires_at: expiresAt, used: false })

      if (insertError) throw insertError

      // Generate the reset link
      const resetLink = `${siteUrl.replace(/\/+$/, '')}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

      // In development mode, return the link so we can display it on screen
      // For production, you'd send this via email (Resend, SendGrid, etc.)
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Reset link generated.',
          resetLink, // Frontend will display this link
        }),
      }
    }

    // ========== VALIDATE: Check if token is valid ==========
    if (body.action === 'validate') {
      const { token, email } = body
      if (!token || !email) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Token and email are required' }) }
      }

      const { data: records, error: fetchError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('email', email)
        .eq('used', false)

      if (fetchError) throw fetchError

      const validRecord = records?.[0]
      if (!validRecord) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid or expired reset link.' }) }
      }

      // Check expiry
      if (new Date(validRecord.expires_at) < new Date()) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Reset link has expired. Please request a new one.' }) }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, valid: true }),
      }
    }

    // ========== RESET: Update password & mark token used ==========
    if (body.action === 'reset') {
      const { token, email, password } = body
      if (!token || !email || !password) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Token, email, and password are required' }) }
      }

      if (password.length < 6) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Password must be at least 6 characters' }) }
      }

      // Verify token
      const { data: records, error: fetchError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('email', email)
        .eq('used', false)

      if (fetchError) throw fetchError

      const validRecord = records?.[0]
      if (!validRecord) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid or expired reset link.' }) }
      }

      if (new Date(validRecord.expires_at) < new Date()) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Reset link has expired. Please request a new one.' }) }
      }

      // Find the user by email and update password
      const { data: users } = await supabase.auth.admin.listUsers()
      const targetUser = users.users.find(u => u.email === email)

      if (!targetUser) {
        return { statusCode: 400, body: JSON.stringify({ error: 'User not found.' }) }
      }

      // Update the user's password using admin API
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        { password }
      )

      if (updateError) throw updateError

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', validRecord.id)

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Password has been reset successfully.' }),
      }
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action. Use send, validate, or reset.' }) }
  } catch (err) {
    console.error('Reset password error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error. Please try again.' }),
    }
  }
}

