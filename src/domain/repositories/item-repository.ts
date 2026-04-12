// AIDEV-NOTE: port interface — swap Prisma for Supabase by implementing this interface
import type { CreateItemInput, Item, UpdateItemInput } from "@/types"

export interface ItemRepository {
  findById(id: string): Promise<Item | null>
  findAllByList(listId: string): Promise<Item[]>
  create(listId: string, data: CreateItemInput): Promise<Item>
  update(id: string, data: UpdateItemInput): Promise<Item>
  delete(id: string): Promise<void>
}
