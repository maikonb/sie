import { notFound } from "next/navigation"
import { getProjectLegalInstrument } from "@/actions/projects"
import LegalInstrumentFillClient from "@/components/projects/legal-instrument-fill"

type Props = {
  params: {
    slug: string
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const instance = await getProjectLegalInstrument(slug)

  if (!instance) {
    return notFound()
  }

  return <LegalInstrumentFillClient instance={instance} projectSlug={slug} />
}
