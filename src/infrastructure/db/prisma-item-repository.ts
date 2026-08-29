// AIDEV-NOTE: infrastructure adapter — implements ItemRepository port using Prisma
import { prisma } from "@/lib/prisma"
import type { CreateItemInput, Item, PaginatedItems, UpdateItemInput } from "@/types"
import type { ItemRepository } from "@/domain/repositories"
import { DEFAULT_ITEM_PAGE_SIZE } from "@/domain/repositories/item-repository"

export class PrismaItemRepository implements ItemRepository {
  async findById(id: string): Promise<Item | null> {
    return prisma.item.findUnique({ where: { id } })
  }

  async findAllByList(listId: string): Promise<Item[]> {
    return prisma.item.findMany({
      where: { listId },
      orderBy: { position: "asc" },
    })
  }

  async findPageByList(
    listId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<PaginatedItems> {
    const page = Math.max(1, params?.page ?? 1)
    const pageSize = Math.max(1, params?.pageSize ?? DEFAULT_ITEM_PAGE_SIZE)

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where: { listId },
        orderBy: { position: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.item.count({ where: { listId } }),
    ])

    return { items, total }
  }

  async create(listId: string, data: CreateItemInput): Promise<Item> {
    return prisma.item.create({
      data: { ...data, listId },
    })
  }

  async update(id: string, data: UpdateItemInput): Promise<Item> {
    return prisma.item.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.item.delete({ where: { id } })
  }
}
