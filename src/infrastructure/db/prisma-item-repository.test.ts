// AIDEV-NOTE: verifies PrismaItemRepository calls the right Prisma model methods
// with the right args and returns the Prisma result as-is (already domain-shaped).
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { CreateItemInput, UpdateItemInput } from "@/types"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
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
const { PrismaItemRepository } = await import("@/infrastructure/db/prisma-item-repository")

describe("PrismaItemRepository", () => {
  const repo = new PrismaItemRepository()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("findById queries by id", async () => {
    const item = { id: "item-1" }
    vi.mocked(prisma.item.findUnique).mockResolvedValueOnce(item as never)

    const result = await repo.findById("item-1")

    expect(prisma.item.findUnique).toHaveBeenCalledWith({ where: { id: "item-1" } })
    expect(result).toBe(item)
  })

  it("findAllByList queries by listId ordered by position, unbounded", async () => {
    const items = [{ id: "item-1" }, { id: "item-2" }]
    vi.mocked(prisma.item.findMany).mockResolvedValueOnce(items as never)

    const result = await repo.findAllByList("list-1")

    expect(prisma.item.findMany).toHaveBeenCalledWith({
      where: { listId: "list-1" },
      orderBy: { position: "asc" },
    })
    expect(result).toBe(items)
  })

  it("findPageByList queries by listId ordered by position, paginated with defaults", async () => {
    const items = [{ id: "item-1" }]
    vi.mocked(prisma.item.findMany).mockResolvedValueOnce(items as never)
    vi.mocked(prisma.item.count).mockResolvedValueOnce(1 as never)

    const result = await repo.findPageByList("list-1")

    expect(prisma.item.findMany).toHaveBeenCalledWith({
      where: { listId: "list-1" },
      orderBy: { position: "asc" },
      skip: 0,
      take: 50,
    })
    expect(prisma.item.count).toHaveBeenCalledWith({ where: { listId: "list-1" } })
    expect(result).toEqual({ items, total: 1 })
  })

  it("findPageByList applies page/pageSize to skip/take", async () => {
    const items = [{ id: "item-101" }]
    vi.mocked(prisma.item.findMany).mockResolvedValueOnce(items as never)
    vi.mocked(prisma.item.count).mockResolvedValueOnce(1000 as never)

    const result = await repo.findPageByList("list-1", { page: 3, pageSize: 50 })

    expect(prisma.item.findMany).toHaveBeenCalledWith({
      where: { listId: "list-1" },
      orderBy: { position: "asc" },
      skip: 100,
      take: 50,
    })
    expect(result).toEqual({ items, total: 1000 })
  })

  it("findPageByList clamps page/pageSize below 1 up to 1", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValueOnce([] as never)
    vi.mocked(prisma.item.count).mockResolvedValueOnce(0 as never)

    await repo.findPageByList("list-1", { page: -1, pageSize: 0 })

    expect(prisma.item.findMany).toHaveBeenCalledWith({
      where: { listId: "list-1" },
      orderBy: { position: "asc" },
      skip: 0,
      take: 1,
    })
  })

  it("create merges listId into the input data", async () => {
    const input: CreateItemInput = { content: "Do the thing" }
    const created = { id: "item-1", ...input, listId: "list-1" }
    vi.mocked(prisma.item.create).mockResolvedValueOnce(created as never)

    const result = await repo.create("list-1", input)

    expect(prisma.item.create).toHaveBeenCalledWith({
      data: { ...input, listId: "list-1" },
    })
    expect(result).toBe(created)
  })

  it("update passes id and data straight through", async () => {
    const input: UpdateItemInput = { content: "Updated" }
    const updated = { id: "item-1", content: "Updated" }
    vi.mocked(prisma.item.update).mockResolvedValueOnce(updated as never)

    const result = await repo.update("item-1", input)

    expect(prisma.item.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: input,
    })
    expect(result).toBe(updated)
  })

  it("delete removes by id and resolves to void", async () => {
    vi.mocked(prisma.item.delete).mockResolvedValueOnce({} as never)

    const result = await repo.delete("item-1")

    expect(prisma.item.delete).toHaveBeenCalledWith({ where: { id: "item-1" } })
    expect(result).toBeUndefined()
  })
})
