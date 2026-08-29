// AIDEV-NOTE: port interface — swap Prisma for Supabase by implementing this interface
import type { CreateListInput, List, PaginatedLists, UpdateListInput } from "@/types"

// AIDEV-NOTE: default page size for findAllByOwner (dashboard "your lists" view)
export const DEFAULT_LIST_PAGE_SIZE = 20

export interface ListRepository {
  // AIDEV-NOTE: lean — no items include. Callers that need items must fetch them
  // separately via ItemRepository.findPageByList/findAllByList (see prisma-list-repository.ts
  // and the callers audited in src/app/**/page.tsx and src/app/api/**).
  findById(id: string): Promise<List | null>
  findByOwnerAndSlug(ownerId: string, slug: string): Promise<List | null>
  findAllByOwner(
    ownerId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<PaginatedLists>
  create(ownerId: string, data: CreateListInput): Promise<List>
  update(id: string, data: UpdateListInput): Promise<List>
  delete(id: string): Promise<void>
}
