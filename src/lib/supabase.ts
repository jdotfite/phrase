import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://odtetapubiiqzlfrcfxr.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabase: any;

if (typeof window !== 'undefined') {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  })
}

// Helper function to check if user is authenticated
export const checkAuth = async () => {
  if (typeof window === 'undefined') {
    return null; // Return null if running on server-side
  }
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export { supabase }