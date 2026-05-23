import { verifyAuth, setCors } from './_middleware.js'

const PLANS = {
  pro: { amount: 29900, name: 'Pro Plan' },
  business: { amount: 99900, name: 'Business Plan' },
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { user } = await verifyAuth(req)
    const { plan } = req.body
    if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' })

    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')
    const r = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount: PLANS[plan].amount,
        currency: 'INR',
        receipt: `rowmatic_${user.id.slice(0, 8)}_${Date.now()}`,
        notes: { userId: user.id, plan },
      }),
    })
    const order = await r.json()
    if (order.error) throw new Error(order.error.description)
    res.json({ id: order.id, amount: order.amount, currency: order.currency })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
