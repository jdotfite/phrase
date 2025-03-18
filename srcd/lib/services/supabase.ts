import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

export const checkAuth = async () => {
  if (typeof window === 'undefined') {
    return null
  }
  const { data: { session } } = await supabase.auth.getSession()
  return session
}