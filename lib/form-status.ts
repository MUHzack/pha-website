import { getSupabaseAdmin } from '@/lib/supabase-admin'
import type { Branch } from '@/lib/supabase'

export async function getFormStatus(sessionId: string, branch: Branch = 'primary') {
  const { data, error } = await getSupabaseAdmin(branch)
    .from('photobox_download_forms')
    .select('created_at')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error) {
    console.error('Failed to read customer review status from Supabase:', error.message)
    throw new Error('Data review tidak dapat dibaca dari Supabase. Pastikan tabel photobox_download_forms dan policy SELECT sudah diterapkan.')
  }

  return {
    submitted: Boolean(data),
    submittedAt: data?.created_at ?? undefined,
  }
}
