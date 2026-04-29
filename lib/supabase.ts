import { createClient } from '@supabase/supabase-js'
import { SessionData, SessionFile } from '@/types/session'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getSessionData(sessionId: string): Promise<SessionData | null> {
  console.log('🔥 Fetching session:', sessionId)

  const { data, error } = await supabase
    .from('photobox_session_files')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  console.log('📦 Raw data:', data)

  if (error || !data || data.length === 0) return null

  const files = data as SessionFile[]

  // ✅ mapping sesuai DB terbaru kamu
  const photo = files.find(f => f.kind === 'final')
  const livePhoto = files.find(f => f.kind === 'live_photo')
  const gif = files.find(f => f.kind === 'gif')

  return {
    sessionId,
    files,
    photo: photo ?? null,
    livePhoto: livePhoto ?? null,
    gif: gif ?? null,
  }
}

// Helper: generate public URL dari storage
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}