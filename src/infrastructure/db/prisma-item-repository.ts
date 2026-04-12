// AIDEV-NOTE: infrastructure adapter — implements ItemRepository port using Prisma
import { prisma } from "@/lib/prisma"
import type { CreateItemInput, Item, UpdateItemInput } from "@/types"
import type { ItemRepository } from "@/domain/repositories"

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
