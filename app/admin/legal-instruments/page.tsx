import Link from "next/link"
import { getLegalInstruments } from "@/actions/legal-instruments"
import { notFound } from "next/navigation"

export default async function Page() {
  let list = []
  try {
    list = await getLegalInstruments()
  } catch (err) {
    console.error(err)
    return notFound()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Instrumentos Jurídicos</h1>
      <div className="space-y-2">
        {list.map((li) => (
          <div key={li.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{li.name}</div>
              <div className="text-sm text-muted-foreground">{li.description}</div>
            </div>
            <div>
              <Link href={`/admin/legal-instruments/${li.id}`} className="text-primary-600 hover:underline">
                Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
