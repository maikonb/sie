interface PageProps {
  searchParams: Promise<{ slug?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { slug = null } = await searchParams

  return (
    <div>
      <h1>Instrumento Jurídico</h1>
    </div>
  )
}