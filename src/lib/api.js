import { supabase } from './supabase'

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

async function apiFetch(path, options = {}) {
  const token = await getToken()
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'API error')
  return data
}

export const processFile = (fileText, instruction, fileType) =>
  apiFetch('/process', { method: 'POST', body: JSON.stringify({ fileText, instruction, fileType }) })

export const createExcel = (instruction) =>
  apiFetch('/create', { method: 'POST', body: JSON.stringify({ instruction }) })

export const getUsage = () => apiFetch('/usage')

export const createOrder = (plan) =>
  apiFetch('/order', { method: 'POST', body: JSON.stringify({ plan }) })

export const verifyPayment = (data) =>
  apiFetch('/verify', { method: 'POST', body: JSON.stringify(data) })
