import { createClient } from '@supabase/supabase-js'
import { SessionData, SessionFile } from '@/types/session'

export type Branch = 'primary' | 'uc'

const clients = new Map<Branch, ReturnType<typeof createClient<any>>>()

export function getSupabase(branch: Branch = 'primary') {
  const existing = clients.get(branch)
  if (existing) return existing

  const url = branch === 'uc' ? process.env.NEXT_PUBLIC_UC_SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = branch === 'uc' ? process.env.NEXT_PUBLIC_UC_SUPABASE_ANON_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(branch === 'uc'
      ? 'Konfigurasi Supabase UC belum lengkap. Tambahkan NEXT_PUBLIC_UC_SUPABASE_URL dan NEXT_PUBLIC_UC_SUPABASE_ANON_KEY.'
      : 'Konfigurasi Supabase primary belum lengkap.')
  }

  const client = createClient(url, key)
  clients.set(branch, client)
  return client
}

export const supabase = getSupabase()

export async function getSessionData(sessionId: string, branch: Branch = 'primary'): Promise<SessionData | null> {
  console.log('🔥 Fetching session:', sessionId)

  const { data, error } = await getSupabase(branch)
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
  ).sort((a, b) => shotNumber(a.storage_path) - shotNumber(b.storage_path))

  return {
    sessionId,
    branch,
    files,
    photo: photo ?? null,
    livePhoto: livePhoto ?? null,
    gif: gif ?? null,
    shots,
  }
}

function shotNumber(path: string): number {
  const match = path.match(/shot-(\d+)/)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

export function getPublicUrl(bucket: string, path: string, options?: { width?: number; quality?: number }, branch: Branch = 'primary'): string {
  const s3PublicUrl = branch === 'uc'
    ? process.env.NEXT_PUBLIC_UC_S3_PUBLIC_URL
    : process.env.NEXT_PUBLIC_S3_PUBLIC_URL
  if (bucket === 'photogenics-media-db' && s3PublicUrl) {
    const baseUrl = `${s3PublicUrl}/${bucket}/${path}`
    if (options?.width || options?.quality) {
      const params = new URLSearchParams()
      if (options.width) params.set('width', String(options.width))
      if (options.quality) params.set('quality', String(options.quality))
      return `${baseUrl}?${params.toString()}`
    }
    return baseUrl
  }
  const { data } = getSupabase(branch).storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
