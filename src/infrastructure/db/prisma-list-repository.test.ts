// AIDEV-NOTE: verifies PrismaListRepository calls the right Prisma model methods
// with the right args and returns the Prisma result as-is (already domain-shaped).
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { CreateListInput, UpdateListInput } from "@/types"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    list: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

const { prisma } = await import("@/lib/prisma")
const { PrismaListRepository } = await import("@/infrastructure/db/prisma-list-repository")

describe("PrismaListRepository", () => {
  const repo = new PrismaListRepository()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("findById queries by id without including items", async () => {
    const list = { id: "list-1" }
    vi.mocked(prisma.list.findUnique).mockResolvedValueOnce(list as never)

    const result = await repo.findById("list-1")

    expect(prisma.list.findUnique).toHaveBeenCalledWith({
      where: { id: "list-1" },
    })
    expect(result).toBe(list)
  })

  it("findByOwnerAndSlug queries by the composite ownerId_slug key without including items", async () => {
    const list = { id: "list-1" }
    vi.mocked(prisma.list.findUnique).mockResolvedValueOnce(list as never)

    const result = await repo.findByOwnerAndSlug("owner-1", "my-slug")

    expect(prisma.list.findUnique).toHaveBeenCalledWith({
      where: { ownerId_slug: { ownerId: "owner-1", slug: "my-slug" } },
    })
    expect(result).toBe(list)
  })

  it("findAllByOwner queries by ownerId ordered by most recently updated, paginated with defaults", async () => {
    const lists = [{ id: "list-1" }]
    vi.mocked(prisma.list.findMany).mockResolvedValueOnce(lists as never)
    vi.mocked(prisma.list.count).mockResolvedValueOnce(1 as never)

    const result = await repo.findAllByOwner("owner-1")

    expect(prisma.list.findMany).toHaveBeenCalledWith({
      where: { ownerId: "owner-1" },
      orderBy: { updatedAt: "desc" },
      skip: 0,
      take: 20,
    })
    expect(prisma.list.count).toHaveBeenCalledWith({ where: { ownerId: "owner-1" } })
    expect(result).toEqual({ lists, total: 1 })
  })

  it("findAllByOwner applies page/pageSize to skip/take", async () => {
    const lists = [{ id: "list-21" }]
    vi.mocked(prisma.list.findMany).mockResolvedValueOnce(lists as never)
    vi.mocked(prisma.list.count).mockResolvedValueOnce(45 as never)

    const result = await repo.findAllByOwner("owner-1", { page: 3, pageSize: 10 })

    expect(prisma.list.findMany).toHaveBeenCalledWith({
      where: { ownerId: "owner-1" },
      orderBy: { updatedAt: "desc" },
      skip: 20,
      take: 10,
    })
    expect(result).toEqual({ lists, total: 45 })
  })

  it("findAllByOwner clamps page/pageSize below 1 up to 1", async () => {
    vi.mocked(prisma.list.findMany).mockResolvedValueOnce([] as never)
    vi.mocked(prisma.list.count).mockResolvedValueOnce(0 as never)

    await repo.findAllByOwner("owner-1", { page: 0, pageSize: -5 })

    expect(prisma.list.findMany).toHaveBeenCalledWith({
      where: { ownerId: "owner-1" },
      orderBy: { updatedAt: "desc" },
      skip: 0,
      take: 1,
    })
  })

  it("create merges ownerId into the input data", async () => {
    const input: CreateListInput = { title: "My List", slug: "my-list" }
    const created = { id: "list-1", ...input, ownerId: "owner-1" }
    vi.mocked(prisma.list.create).mockResolvedValueOnce(created as never)

    const result = await repo.create("owner-1", input)

    expect(prisma.list.create).toHaveBeenCalledWith({
      data: { ...input, ownerId: "owner-1" },
    })
    expect(result).toBe(created)
  })

  it("update passes id and data straight through", async () => {
    const input: UpdateListInput = { title: "Renamed" }
    const updated = { id: "list-1", title: "Renamed" }
    vi.mocked(prisma.list.update).mockResolvedValueOnce(updated as never)

    const result = await repo.update("list-1", input)

    expect(prisma.list.update).toHaveBeenCalledWith({
      where: { id: "list-1" },
      data: input,
    })
    expect(result).toBe(updated)
  })

  it("delete removes by id and resolves to void", async () => {
    vi.mocked(prisma.list.delete).mockResolvedValueOnce({} as never)

    const result = await repo.delete("list-1")

    expect(prisma.list.delete).toHaveBeenCalledWith({ where: { id: "list-1" } })
    expect(result).toBeUndefined()
  })
})
