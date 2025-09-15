import { createClient } from '@supabase/supabase-js'
    import dotenv from 'dotenv'
    dotenv.config({ path: '../server/backend.env'});

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export const setUserContext = async (username) => {
  const { error } = await supabase.rpc('set_config', {
    setting_name: 'myapp.username',
    setting_value: username,
    is_local: true
  })
  if (error) console.error('Error setting user context:', error)
}
