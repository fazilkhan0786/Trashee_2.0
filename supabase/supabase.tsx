import { createClient } from '@supabase/supabase-js'

// Extend the global ImportMeta interface to include Vite's env
declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ascqdjqxiuygvvmawyrx.supabase.co"
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL) {
  throw new Error('Missing Supabase URL')
}

if (!SUPABASE_KEY) {
  throw new Error('Missing Supabase Key')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)