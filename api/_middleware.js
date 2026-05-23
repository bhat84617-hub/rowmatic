import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function verifyAuth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('Token required')
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) throw new Error('Invalid token')
  return { user: data.user, supabase }
}

export async function checkUsage(supabase, userId) {
  const { data: profile } = await supabase
    .from('profiles').select('plan').eq('id', userId).single()
  const plan = profile?.plan || 'free'
  if (plan !== 'free') return { plan, allowed: true }

  const start = new Date()
  start.setDate(1); start.setHours(0, 0, 0, 0)
  const { count } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', start.toISOString())

  const FREE_LIMIT = 10
  return { plan, allowed: (count || 0) < FREE_LIMIT, used: count || 0, limit: FREE_LIMIT }
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}
