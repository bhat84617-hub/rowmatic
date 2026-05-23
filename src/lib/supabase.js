import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })

export const signInWithEmail = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUpWithEmail = (email, password, name) =>
  supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })

export const signOut = () => supabase.auth.signOut()
