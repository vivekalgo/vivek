import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fail gracefully if keys are missing (prevents white screen crash)
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase keys are missing! Check .env or GitHub Secrets.')
}

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
