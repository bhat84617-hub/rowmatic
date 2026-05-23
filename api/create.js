import { callAI, SYSTEM_PROMPT } from './services/ai.js'
import { verifyAuth, checkUsage, setCors } from './_middleware.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { user, supabase } = await verifyAuth(req)
    const usage = await checkUsage(supabase, user.id)
    if (!usage.allowed) {
      return res.status(429).json({
        error: `Monthly limit reach ho gayi! Pro plan lo unlimited ke liye.`,
        upgrade: true
      })
    }

    const { instruction } = req.body
    if (!instruction?.trim()) return res.status(400).json({ error: 'Instruction required hai' })

    const prompt = `${SYSTEM_PROMPT}

MODE: CREATE FROM SCRATCH

USER WANTS: "${instruction}"

Create a comprehensive, professional Excel spreadsheet from scratch.
Use realistic Indian names, cities, and data.
Include at least 12-15 data rows.
Add totals/averages/summary rows where appropriate.
Use multiple sheets if the data warrants it.
Return JSON.`

    const result = await callAI(prompt)
    if (!result.sheets?.length) throw new Error('AI ne kuch return nahi kiya')

    await supabase.from('usage_logs').insert({
      user_id: user.id,
      file_type: 'scratch',
      instruction: instruction.substring(0, 500),
      operation_type: 'create',
      ai_provider: process.env.AI_PROVIDER || 'gemini',
      plan: usage.plan,
    })

    res.json(result)
  } catch (e) {
    console.error('Create error:', e)
    res.status(500).json({ error: e.message })
  }
}
