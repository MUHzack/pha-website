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
  return { title: `Softfile UC #${sessionId} — Photogenics` }
}

export default async function UCSessionPage({ params }: Props) {
  const { sessionId } = await params
  if (!sessionId || !/^[a-zA-Z0-9_-]{3,60}$/.test(sessionId)) return <InvalidSession />

  let session
  try {
    session = await getSessionData(sessionId, 'uc')
  } catch (error) {
    console.error('Failed to load UC session:', error)
    return <InvalidSession />
  }
  if (!session) return <InvalidSession />

  if (!session.photo && !session.livePhoto && !session.gif) return <ProcessingSession />

  let needsForm = false
  try {
    const status = await getFormStatus(sessionId, 'uc')
    needsForm = !status.submitted
  } catch (error) {
    console.error('Failed to check UC review status:', error)
    needsForm = true
  }
  if (needsForm) redirect(`/uc/${sessionId}/form`)

  const showShots = process.env.SHOW_SHOT_PHOTOS === 'true'
  const enableSinglePhotoFrames = process.env.ENABLE_SINGLE_PHOTO_FRAMES === 'true'
  return <SoftfileClient session={showShots ? session : { ...session, shots: [] }} enableSinglePhotoFrames={enableSinglePhotoFrames} />
}
