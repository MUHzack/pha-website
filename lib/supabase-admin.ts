import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Branch } from '@/lib/supabase'

const adminClients = new Map<Branch, SupabaseClient>()

export function getSupabaseAdmin(branch: Branch = 'primary'): SupabaseClient {
  const existing = adminClients.get(branch)
  if (existing) return existing

  const url = branch === 'uc' ? process.env.NEXT_PUBLIC_UC_SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = branch === 'uc' ? process.env.UC_SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error(branch === 'uc'
      ? 'Konfigurasi Supabase UC belum lengkap. Tambahkan NEXT_PUBLIC_UC_SUPABASE_URL dan UC_SUPABASE_SERVICE_ROLE_KEY di environment server.'
      : 'Konfigurasi Supabase server belum lengkap. Tambahkan SUPABASE_SERVICE_ROLE_KEY di Vercel.')
  }

  const client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  adminClients.set(branch, client)
  return client
}
