export type FileKindDB =
  | 'final'
  | 'live_photo'
  | 'gif'
  | 'raw'
  | 'metadata'
  | 'other'

export type FileKind = 'photo' | 'live_photo' | 'gif'

export interface SessionFile {
  id: number
  session_id: string
  kind: FileKindDB
  relative_path: string | null
  storage_bucket: string
  storage_path: string
  mime_type: string | null
  file_size_bytes: number | null
  uploaded_at: string | null
  created_at: string
  updated_at: string
}

export interface SessionData {
  sessionId: string
  files: SessionFile[]
  photo: SessionFile | null
  livePhoto: SessionFile | null
  gif: SessionFile | null
  shots: SessionFile[]
}