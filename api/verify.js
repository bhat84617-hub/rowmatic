import crypto from 'crypto'
import { verifyAuth, getSupabase, setCors } from './_middleware.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { user } = await verifyAuth(req)
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body

    // Verify signature
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign).digest('hex')

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' })
    }

    const supabase = getSupabase()

    // Update plan
    await supabase.from('profiles').update({ plan }).eq('id', user.id)

    // Save subscription
    await supabase.from('subscriptions').insert({
      user_id: user.id, plan,
      razorpay_order_id, razorpay_payment_id,
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    res.json({ success: true, plan })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
