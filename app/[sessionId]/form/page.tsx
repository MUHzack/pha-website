import { FormFeedback } from '@/components/FormFeedback'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function FormPage({ params }: Props) {
  const { sessionId } = await params
  return <FormFeedback sessionId={sessionId} />
}
