const API_BASE = '/.netlify/functions/reset-password'

interface ApiResponse {
  success?: boolean
  error?: string
  message?: string
  resetLink?: string | null
  valid?: boolean
}

async function callFunction(body: Record<string, unknown>): Promise<ApiResponse> {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await res.json()
  } catch {
    return { error: 'Network error. Please try again.' }
  }
}

/**
 * Request a password reset link.
 * Returns the resetLink which will be displayed on screen (dev mode)
 * or sent via email (production with Resend configured).
 */
export async function requestPasswordReset(email: string): Promise<{
  error: string | null
  resetLink: string | null
  message: string | null
}> {
  const result = await callFunction({ action: 'send', email })
  if (result.error) return { error: result.error, resetLink: null, message: null }
  return {
    error: null,
    resetLink: result.resetLink ?? null,
    message: result.message ?? null,
  }
}

/**
 * Validate a password reset token.
 */
export async function validateResetToken(token: string, email: string): Promise<{
  error: string | null
  valid: boolean
}> {
  const result = await callFunction({ action: 'validate', token, email })
  if (result.error) return { error: result.error, valid: false }
  return { error: null, valid: result.valid ?? false }
}

/**
 * Reset the password using a valid token.
 */
export async function resetPassword(token: string, email: string, password: string): Promise<{
  error: string | null
  success: boolean
}> {
  const result = await callFunction({ action: 'reset', token, email, password })
  if (result.error) return { error: result.error, success: false }
  return { error: null, success: result.success ?? false }
}

