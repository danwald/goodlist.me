// AIDEV-NOTE: verifies PrismaFaviconRepository calls faviconCache with the right args
// and maps the raw Prisma row into the { data, fetchedAt } domain shape.
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    faviconCache: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

const { prisma } = await import("@/lib/prisma")
const { PrismaFaviconRepository } = await import("@/infrastructure/db/prisma-favicon-repository")

describe("PrismaFaviconRepository", () => {
  const repo = new PrismaFaviconRepository()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("findByDomain returns null when no row exists", async () => {
    vi.mocked(prisma.faviconCache.findUnique).mockResolvedValueOnce(null)

    const result = await repo.findByDomain("example.com")

    expect(prisma.faviconCache.findUnique).toHaveBeenCalledWith({ where: { domain: "example.com" } })
    expect(result).toBeNull()
  })

  it("findByDomain maps the row's bytes into a Uint8Array alongside fetchedAt", async () => {
    const fetchedAt = new Date("2026-01-01T00:00:00Z")
    const rawBytes = Buffer.from([1, 2, 3])
    vi.mocked(prisma.faviconCache.findUnique).mockResolvedValueOnce({
      domain: "example.com",
      data: rawBytes,
      fetchedAt,
    } as never)

    const result = await repo.findByDomain("example.com")

    expect(result).not.toBeNull()
    expect(result?.fetchedAt).toBe(fetchedAt)
    expect(result?.data).toBeInstanceOf(Uint8Array)
    expect(Array.from(result?.data ?? [])).toEqual([1, 2, 3])
  })

  it("upsert creates or updates the cache row with fresh data and fetchedAt", async () => {
    vi.mocked(prisma.faviconCache.upsert).mockResolvedValueOnce({} as never)
    const data = new Uint8Array([4, 5, 6]) as Uint8Array<ArrayBuffer>

    await repo.upsert("example.com", data)

    expect(prisma.faviconCache.upsert).toHaveBeenCalledTimes(1)
    const call = vi.mocked(prisma.faviconCache.upsert).mock.calls[0]?.[0] as {
      where: { domain: string }
      update: { data: Uint8Array; fetchedAt: Date }
      create: { domain: string; data: Uint8Array }
    }
    expect(call.where).toEqual({ domain: "example.com" })
    expect(call.update.data).toBe(data)
    expect(call.update.fetchedAt).toBeInstanceOf(Date)
    expect(call.create).toEqual({ domain: "example.com", data })
  })
})
