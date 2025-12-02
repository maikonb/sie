import { formatSegment } from './format-segment'
import { BREADCRUMB_MAP } from './breadcrumb-map'

export type BreadcrumbItem = {
  href: string
  label: string
}

export function getBreadcrumbs(pathname: string | null | undefined): BreadcrumbItem[] {
  const path = pathname ?? '/'
  if (path === '' || path === '/') return [{ href: '/', label: BREADCRUMB_MAP[''] ?? 'Início' }]

  const segments = path.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  // Always start with home
  breadcrumbs.push({ href: '/', label: BREADCRUMB_MAP[''] ?? 'Início' })

  let accumulated = ''
  segments.forEach((seg) => {
    accumulated += `/${seg}`
    // If there's a known friendly name, use it; otherwise format the segment
    const label = BREADCRUMB_MAP[seg] ?? formatSegment(seg)
    breadcrumbs.push({ href: accumulated, label })
  })

  return breadcrumbs
}
