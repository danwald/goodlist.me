// AIDEV-NOTE: infrastructure adapter — implements FaviconRepository using Prisma bytea storage
import { prisma } from "@/lib/prisma"
import type { FaviconRepository } from "@/domain/repositories"

export class PrismaFaviconRepository implements FaviconRepository {
  async findByDomain(domain: string): Promise<{ data: Uint8Array<ArrayBuffer>; fetchedAt: Date } | null> {
    const row = await prisma.faviconCache.findUnique({ where: { domain } })
    if (!row) return null
    return { data: new Uint8Array(row.data) as Uint8Array<ArrayBuffer>, fetchedAt: row.fetchedAt }
  }

  async upsert(domain: string, data: Uint8Array<ArrayBuffer>): Promise<void> {
    await prisma.faviconCache.upsert({
      where: { domain },
      update: { data, fetchedAt: new Date() },
      create: { domain, data },
    })
  }
}
