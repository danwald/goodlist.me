// AIDEV-NOTE: infrastructure adapter — implements ListRepository port using Prisma
import { prisma } from "@/lib/prisma"
import type { CreateListInput, List, ListWithItems, UpdateListInput } from "@/types"
import type { ListRepository } from "@/domain/repositories"

export class PrismaListRepository implements ListRepository {
  async findById(id: string): Promise<ListWithItems | null> {
    return prisma.list.findUnique({
      where: { id },
      include: { items: { orderBy: { position: "asc" } } },
    })
  }

  async findByOwnerAndSlug(ownerId: string, slug: string): Promise<ListWithItems | null> {
    return prisma.list.findUnique({
      where: { ownerId_slug: { ownerId, slug } },
      include: { items: { orderBy: { position: "asc" } } },
    })
  }

  async findAllByOwner(ownerId: string): Promise<List[]> {
    return prisma.list.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" },
    })
  }

  async create(ownerId: string, data: CreateListInput): Promise<List> {
    return prisma.list.create({
      data: { ...data, ownerId },
    })
  }

  async update(id: string, data: UpdateListInput): Promise<List> {
    return prisma.list.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.list.delete({ where: { id } })
  }
}
