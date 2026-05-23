-- ══════════════════════════════════════════════════
-- ROWMATIC — Supabase Database Schema
-- Supabase SQL Editor mein paste karke Run karo
-- ══════════════════════════════════════════════════

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','pro','business')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Usage logs
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_type TEXT,
  instruction TEXT,
  operation_type TEXT CHECK (operation_type IN ('process','create')),
  ai_provider TEXT,
  plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- AUTO CREATE PROFILE ON SIGNUP
-- ══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ══════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile" ON profiles FOR ALL USING (auth.uid() = id);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own logs view" ON usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service insert logs" ON usage_logs FOR INSERT WITH CHECK (true);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own subs" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service manage subs" ON subscriptions FOR ALL WITH CHECK (true);

-- ══════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_usage_user ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_created ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id);
