# ⚡ Rowmatic — Automate Every Row

> AI-powered Excel automation. Koi bhi file do, Hindi ya English mein bolo, perfect Excel milega.

**Stack:** React + Vite | Vercel Serverless | Supabase | Gemini/Nvidia/Groq AI | Razorpay

---

## 🚀 Deploy Karo — Step by Step

### Step 1 — Supabase Setup (10 min)
1. **supabase.com** → New Project → Name: `rowmatic`, Region: Singapore
2. Project ready hone ke baad → **SQL Editor** → `supabase-schema.sql` paste karo → Run
3. **Authentication → Providers → Google** enable karo
4. **Settings → API** se copy karo:
   - `Project URL` → `SUPABASE_URL` & `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2 — AI API Key (2 min)
**Gemini (Free):** aistudio.google.com → Get API Key → Copy → `GEMINI_API_KEY`
**Nvidia (Free):** build.nvidia.com → Get API Key → Copy → `NVIDIA_API_KEY`
**Groq (Free):** console.groq.com → API Keys → Copy → `GROQ_API_KEY`

### Step 3 — Razorpay (10 min)
1. razorpay.com → Account banao
2. Settings → API Keys → Generate
3. Key ID → `RAZORPAY_KEY_ID` & `VITE_RAZORPAY_KEY_ID`
4. Secret → `RAZORPAY_KEY_SECRET`

### Step 4 — Vercel Deploy (5 min)
1. **github.com** → New repo → Upload rowmatic folder
2. **vercel.com** → New Project → Import repo
3. Environment Variables mein sab add karo (neeche dekho)
4. Deploy!

---

## ⚙️ Environment Variables (Vercel mein add karo)

```
AI_PROVIDER=gemini

GEMINI_API_KEY=AIza...
NVIDIA_API_KEY=nvapi-...
GROQ_API_KEY=gsk_...

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...

VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_RAZORPAY_KEY_ID=rzp_live_...
```

---

## 💻 Local Development

```bash
git clone your-repo
cd rowmatic
npm install
cp .env.example .env
# .env fill karo
npm run dev
# localhost:5173 pe open hoga
```

---

## 📁 Project Structure

```
rowmatic/
├── api/                    ← Vercel Serverless Functions
│   ├── services/ai.js      ← Unified AI (Gemini/Nvidia/Groq/OpenAI/Mistral/Claude)
│   ├── _middleware.js      ← Auth + Usage check
│   ├── process.js          ← File process karo
│   ├── create.js           ← Scratch se banao
│   ├── usage.js            ← Usage stats
│   ├── order.js            ← Razorpay order
│   └── verify.js           ← Payment verify
├── src/
│   ├── pages/
│   │   ├── Home.jsx        ← Main app
│   │   ├── Auth.jsx        ← Login/Signup
│   │   ├── Dashboard.jsx   ← User dashboard
│   │   └── Pricing.jsx     ← Plans + Payment
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Background.jsx
│   └── lib/
│       ├── supabase.js
│       ├── api.js
│       └── fileProcessor.js
├── supabase-schema.sql     ← DB setup
├── vercel.json
├── .env.example
└── package.json
```

---

## 💰 Pricing Plans

| Plan | Price | Files |
|------|-------|-------|
| Free | ₹0 | 10/month |
| Pro | ₹299/month | Unlimited |
| Business | ₹999/month | Unlimited + API |

---

## 🤖 Supported AI Providers

| Provider | Cost | Speed |
|----------|------|-------|
| Gemini 1.5 Flash | Free (1500/day) | Fast |
| Nvidia NIM (Llama) | Free credits | Very Fast |
| Groq (Llama) | Free (14400/day) | Fastest |
| OpenAI GPT-4o Mini | Paid | Fast |
| Mistral | Free tier | Fast |
| Claude Haiku | Paid | Fast |

Set `AI_PROVIDER` env var to switch: `gemini` \| `nvidia` \| `groq` \| `openai` \| `mistral` \| `claude`

---

Made with ❤️ in India • support@rowmatic.io
