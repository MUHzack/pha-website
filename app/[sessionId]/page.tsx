import { getSessionData } from '@/lib/supabase'
import { checkFormStatus } from '@/lib/api'
import { SoftfileClient } from '@/components/SoftfileClient'
import { InvalidSession } from '@/components/InvalidSession'
import { ProcessingSession } from '@/components/ProcessingSession'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ sessionId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { sessionId } = await params

  return {
    title: `Softfile #${sessionId} — Photogenics`,
  }
}

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

  const hasAnyFile = session.photo || session.livePhoto || session.gif

  if (!hasAnyFile) {
    return <ProcessingSession />
  }

  try {
    const formStatus = await checkFormStatus(sessionId)
    if (!formStatus.submitted) {
      redirect(`/${sessionId}/form`)
    }
  } catch (error) {
    console.error('Failed to check form status:', error)
  }

  const showShots = process.env.SHOW_SHOT_PHOTOS === 'true'

  return <SoftfileClient session={showShots ? session : { ...session, shots: [] }} />
}