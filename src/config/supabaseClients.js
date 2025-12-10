import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPERBASE_URL
const supabaseKey = process.env.REACT_APP_SUPERBASE_ANON_KEY

// Optional: Add validation
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are not set. Check your .env file.');
  // You might want to show a user-friendly error in development
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  // Optional: Add any additional configuration
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

export default supabase;