import { getSessionData } from '@/lib/supabase'
import { getFormStatus } from '@/lib/form-status'
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

  let needsForm = false
  try {
    const formStatus = await getFormStatus(sessionId)
    needsForm = !formStatus.submitted
  } catch (error) {
    console.error('Failed to check form status:', error)
    // If status cannot be verified, keep the download page behind the form gate.
    needsForm = true
  }

  // Next.js redirect() throws to terminate rendering, so keep it outside try/catch.
  if (needsForm) {
    redirect(`/${sessionId}/form`)
  }

  const showShots = process.env.SHOW_SHOT_PHOTOS === 'true'

  return <SoftfileClient session={showShots ? session : { ...session, shots: [] }} />
}
