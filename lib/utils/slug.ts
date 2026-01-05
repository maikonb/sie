import { prisma } from "@/lib/config/db"
import { nanoid } from 'nanoid';

export async function generateUniqueSlug(title: string): Promise<string> {
  // 1. Convert title to initial slug
  let slug = title
    .toLowerCase()
    .normalize("NFD") // Split accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens

  if (!slug) {
    slug = "projeto" // Fallback if title is all special chars
  }

  // 2. Check for uniqueness
  let uniqueSlug = slug

  while (true) {
    const existing = await prisma.project.findUnique({
      where: { slug: uniqueSlug },
      select: { id: true },
    })

    if (!existing) {
      break
    }

    const shortId = nanoid(8);
    uniqueSlug = `${slug}-${shortId}`
  }

  return uniqueSlug
}
