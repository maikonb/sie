import { notFound } from "next/navigation"
import requirePermissionOr404 from "@/lib/guards"
import EditLegalInstrumentClient from "@/components/admin/legal-instrument-editor"
import { getLegalInstrumentById } from "@/actions/legal-instruments"

type Props = { params: { id: string } }

export default async function Page({ params }: Props) {
  await requirePermissionOr404({ slug: "legal_instruments.manage" })
  let li = null;
  const id = params.id
  try {
    // TODO: REMOVE ERROR
    li = await getLegalInstrumentById(id)
  } catch (err) {
    console.log(err)
    return notFound()
  }

  return <EditLegalInstrumentClient instrument={li} />
}
