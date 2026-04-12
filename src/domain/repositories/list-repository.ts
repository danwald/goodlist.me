// AIDEV-NOTE: port interface — swap Prisma for Supabase by implementing this interface
import type { CreateListInput, List, ListWithItems, UpdateListInput } from "@/types"

export interface ListRepository {
  findById(id: string): Promise<ListWithItems | null>
  findByOwnerAndSlug(ownerId: string, slug: string): Promise<ListWithItems | null>
  findAllByOwner(ownerId: string): Promise<List[]>
  create(ownerId: string, data: CreateListInput): Promise<List>
  update(id: string, data: UpdateListInput): Promise<List>
  delete(id: string): Promise<void>
}
