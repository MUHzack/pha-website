import { FormFeedback } from '@/components/FormFeedback'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function UCFormPage({ params }: Props) {
  const { sessionId } = await params
  return <FormFeedback sessionId={sessionId} branch="uc" />
}
