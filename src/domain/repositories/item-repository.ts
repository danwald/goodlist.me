// AIDEV-NOTE: port interface — swap Prisma for Supabase by implementing this interface
import type { CreateItemInput, Item, PaginatedItems, UpdateItemInput } from "@/types"

// AIDEV-NOTE: default page size for findPageByList (items-within-a-list views)
export const DEFAULT_ITEM_PAGE_SIZE = 50

export interface ItemRepository {
  findById(id: string): Promise<Item | null>
  // AIDEV-NOTE: unbounded — kept for internal use where ALL items of a list are genuinely
  // needed regardless of page (next-position calc on create, bulk favicon refresh). Do not
  // use this to back a paginated page view; use findPageByList for that.
  findAllByList(listId: string): Promise<Item[]>
  findPageByList(
    listId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<PaginatedItems>
  create(listId: string, data: CreateItemInput): Promise<Item>
  update(id: string, data: UpdateItemInput): Promise<Item>
  delete(id: string): Promise<void>
}
