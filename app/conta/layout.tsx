import BaseLayout from "@/components/layouts/base"

export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <BaseLayout>{children}</BaseLayout>
}
