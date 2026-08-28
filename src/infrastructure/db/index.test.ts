// AIDEV-NOTE: verifies the DI factory functions return instances of the correct
// Prisma repository implementations (the swap point referenced in AGENTS.md).
import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    list: {},
    item: {},
    faviconCache: {},
  },
}))

const { getFaviconRepository, getItemRepository, getListRepository } = await import("@/infrastructure/db")
const { PrismaListRepository } = await import("@/infrastructure/db/prisma-list-repository")
const { PrismaItemRepository } = await import("@/infrastructure/db/prisma-item-repository")
const { PrismaFaviconRepository } = await import("@/infrastructure/db/prisma-favicon-repository")

describe("DI factory functions", () => {
  it("getListRepository returns a PrismaListRepository instance", () => {
    expect(getListRepository()).toBeInstanceOf(PrismaListRepository)
  })

  it("getItemRepository returns a PrismaItemRepository instance", () => {
    expect(getItemRepository()).toBeInstanceOf(PrismaItemRepository)
  })

  it("getFaviconRepository returns a PrismaFaviconRepository instance", () => {
    expect(getFaviconRepository()).toBeInstanceOf(PrismaFaviconRepository)
  })

  it("returns a fresh instance on every call", () => {
    expect(getListRepository()).not.toBe(getListRepository())
  })
})
