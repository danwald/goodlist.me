// AIDEV-NOTE: infrastructure adapter — implements FaviconRepository using Prisma bytea storage
import { prisma } from "@/lib/prisma"
import type { FaviconRepository } from "@/domain/repositories"

export class PrismaFaviconRepository implements FaviconRepository {
  async findByDomain(domain: string): Promise<{ data: Buffer; fetchedAt: Date } | null> {
    const row = await prisma.faviconCache.findUnique({ where: { domain } })
    if (!row) return null
    return { data: Buffer.from(row.data), fetchedAt: row.fetchedAt }
  }

  async upsert(domain: string, data: Buffer): Promise<void> {
    await prisma.faviconCache.upsert({
      where: { domain },
      update: { data, fetchedAt: new Date() },
      create: { domain, data },
    })
  }
}
