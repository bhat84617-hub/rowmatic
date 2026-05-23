import { verifyAuth, checkUsage, setCors } from './_middleware.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { user, supabase } = await verifyAuth(req)
    const usage = await checkUsage(supabase, user.id)

    const { count: total } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    res.json({
      plan: usage.plan,
      used: usage.used || 0,
      limit: usage.limit,
      operations: total || 0,
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
