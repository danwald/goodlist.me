// AIDEV-NOTE: infrastructure adapter — implements ListRepository port using Prisma
import { prisma } from "@/lib/prisma"
import type { CreateListInput, List, PaginatedLists, UpdateListInput } from "@/types"
import type { ListRepository } from "@/domain/repositories"
import { DEFAULT_LIST_PAGE_SIZE } from "@/domain/repositories/list-repository"

export class PrismaListRepository implements ListRepository {
  async findById(id: string): Promise<List | null> {
    return prisma.list.findUnique({
      where: { id },
    })
  }

  async findByOwnerAndSlug(ownerId: string, slug: string): Promise<List | null> {
    return prisma.list.findUnique({
      where: { ownerId_slug: { ownerId, slug } },
    })
  }

  async findAllByOwner(
    ownerId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<PaginatedLists> {
    const page = Math.max(1, params?.page ?? 1)
    const pageSize = Math.max(1, params?.pageSize ?? DEFAULT_LIST_PAGE_SIZE)

    const [lists, total] = await Promise.all([
      prisma.list.findMany({
        where: { ownerId },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.list.count({ where: { ownerId } }),
    ])

    return { lists, total }
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
