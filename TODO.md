# Forgot Password & Email Verification Implementation

## Completed ✅

- [x] 1. **Database migration** — `password_reset_tokens` table (token, email, expires_at, used)
- [x] 2. **Netlify Function** — `netlify/functions/reset-password.ts` (3 actions: send, validate, reset)
- [x] 3. **Client helper** — `src/lib/resetPassword.ts` (API calls to Netlify Function)
- [x] 4. **ForgotPasswordPage** — Email input → generates token → shows reset link on screen (dev mode)
- [x] 5. **ResetPasswordPage** — Reads token from URL → validates token → shows reset form → updates password
- [x] 6. **LoginPage** — "Forgot Password?" link added
- [x] 7. **AuthContext** — Cleaned up (removed old Supabase-based reset methods)
- [x] 8. **App.tsx** — Routes already added
- [x] 9. **netlify.toml** — Functions & SPA redirect config
- [x] 10. **Build verified** — `npm run build` passes with zero errors

## For Production Deployment

1. **Add these Netlify environment variables:**
   - `VITE_SUPABASE_URL` — Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service_role key (Settings → API → service_role key)
   - `VITE_SITE_URL` — `https://your-site.netlify.app`

2. **Run the database migration** in Supabase SQL Editor:
   - Open `supabase/migrations/20260710000000_add_password_reset_tokens.sql`
   - Run it in Supabase Dashboard → SQL Editor

3. **To enable email sending** (optional, for production):
   - Sign up at Resend.com (free tier: 100 emails/month)
   - Add `RESEND_API_KEY` to Netlify env vars
   - Update `netlify/functions/reset-password.ts` to send email via Resend

