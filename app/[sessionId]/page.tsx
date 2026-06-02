import { getSessionData } from '@/lib/supabase'
import { SoftfileClient } from '@/components/SoftfileClient'
import { InvalidSession } from '@/components/InvalidSession'
import { ProcessingSession } from '@/components/ProcessingSession'

interface Props {
  params: Promise<{ sessionId: string }>
}

// ✅ FIX generateMetadata
export async function generateMetadata({ params }: Props) {
  const { sessionId } = await params

  return {
    title: `Softfile #${sessionId} — Photogenics`,
  }
}

// ✅ FIX page
export default async function SessionPage({ params }: Props) {
  const { sessionId } = await params

  console.log('✅ Session ID:', sessionId)

  if (!sessionId || !/^[a-zA-Z0-9_-]{3,60}$/.test(sessionId)) {
    return <InvalidSession />
  }

  const session = await getSessionData(sessionId)

  if (!session) {
    return <InvalidSession />
  }

  const hasAnyFile =
    session.photo || session.livePhoto || session.gif || (session.shots && session.shots.length > 0)

  if (!hasAnyFile) {
    return <ProcessingSession />
  }

  return <SoftfileClient session={session} />
}