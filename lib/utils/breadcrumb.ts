import { formatSegment } from "./format-segment"
import { BREADCRUMB_MAP } from "../constrants/breadcrumb-map"

export type BreadcrumbItem = {
  href: string
  label: string
}

export function getBreadcrumbs(pathname: string | null | undefined): BreadcrumbItem[] {
  const path = pathname ?? "/"
  if (path === "" || path === "/") return [{ href: "/", label: BREADCRUMB_MAP[""] ?? "Início" }]

  const segments = path.split("/").filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  breadcrumbs.push({ href: "/", label: BREADCRUMB_MAP[""] ?? "Início" })

  let accumulated = ""
  segments.forEach((seg) => {
    accumulated += `/${seg}`
    const label = BREADCRUMB_MAP[seg] ?? formatSegment(seg)
    breadcrumbs.push({ href: accumulated, label })
  })

  return breadcrumbs
}
