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

  const photo = files.find(f => f.kind === 'final')
  const livePhoto = files.find(f => f.kind === 'live_photo')
  const gif = files.find(f => f.kind === 'gif')
  const shots = files.filter(f => 
    (f.kind === 'raw' || f.kind === 'other') && 
    f.storage_path.includes('/processed/shot-') && 
    f.storage_path.endsWith('.jpg')
  )

  return {
    sessionId,
    files,
    photo: photo ?? null,
    livePhoto: livePhoto ?? null,
    gif: gif ?? null,
    shots,
  }
}

export function getPublicUrl(bucket: string, path: string): string {
  if (bucket === 'photogenics-media-db' && process.env.NEXT_PUBLIC_S3_PUBLIC_URL) {
    return `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${bucket}/${path}`
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}