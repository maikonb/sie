export function formatSegment(segment: string): string {
  if (!segment) return ""
  // Decode URI components, replace dashes/underscores with spaces, trim
  const decoded = decodeURIComponent(segment).replace(/[_]+/g, " ").trim()
  // Capitalize words
  return decoded;
}
