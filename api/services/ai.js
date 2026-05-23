// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Rowmatic — Unified AI Service
// Supports: Gemini | Nvidia | Groq | OpenAI | Mistral | Claude
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PROVIDERS = {
  gemini: {
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`,
    key: () => process.env.GEMINI_API_KEY,
  },
  nvidia: {
    url: 'https://integrate.api.nvidia.com/v1/chat/completions',
    key: () => process.env.NVIDIA_API_KEY,
    model: 'meta/llama-3.3-70b-instruct',
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: () => process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    key: () => process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
  },
  mistral: {
    url: 'https://api.mistral.ai/v1/chat/completions',
    key: () => process.env.MISTRAL_API_KEY,
    model: 'mistral-small-latest',
  },
  claude: {
    url: 'https://api.anthropic.com/v1/messages',
    key: () => process.env.ANTHROPIC_API_KEY,
    model: 'claude-haiku-4-5-20251001',
  },
}

async function callGemini(prompt, key) {
  const res = await fetch(`${PROVIDERS.gemini.url}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`Gemini: ${data.error.message}`)
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

async function callOpenAIStyle(prompt, provider) {
  const cfg = PROVIDERS[provider]
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.key()}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 8192,
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`${provider}: ${data.error.message}`)
  return data.choices?.[0]?.message?.content || ''
}

async function callClaude(prompt, key) {
  const res = await fetch(PROVIDERS.claude.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: PROVIDERS.claude.model,
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`Claude: ${data.error.message}`)
  return data.content?.[0]?.text || ''
}

function parseJSON(raw) {
  const clean = raw.replace(/```json|```/g, '').trim()
  const match = clean.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('AI se valid JSON nahi mila')
  return JSON.parse(match[0])
}

export async function callAI(prompt) {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase()
  const cfg = PROVIDERS[provider]
  if (!cfg) throw new Error(`Unknown AI provider: ${provider}`)

  const key = cfg.key()
  if (!key) throw new Error(`${provider.toUpperCase()}_API_KEY env mein nahi hai`)

  let raw = ''
  if (provider === 'gemini') raw = await callGemini(prompt, key)
  else if (provider === 'claude') raw = await callClaude(prompt, key)
  else raw = await callOpenAIStyle(prompt, provider)

  return parseJSON(raw)
}

export const SYSTEM_PROMPT = `You are Rowmatic — the world's most powerful AI Excel processor and generator.

Your job is to process data OR create Excel spreadsheets from scratch based on user instructions.

ALWAYS return ONLY this exact JSON format (no markdown, no backticks, no explanation):
{
  "sheets": [
    {
      "name": "Sheet1",
      "data": [
        ["Header1", "Header2", "Header3"],
        ["value1", "value2", "value3"]
      ]
    }
  ],
  "summary": "What you did in 1-2 sentences"
}

Rules:
- First row of data array = headers
- Include realistic Indian names/data for create mode
- Add totals/summary rows where appropriate
- Handle Hindi + English + Hinglish instructions
- For create mode: minimum 10-15 data rows
- Multiple sheets if needed
- Return ONLY valid JSON, nothing else`
