// AIDEV-NOTE: DI wiring — swap these implementations to change data layer (e.g. Supabase)
import type { FaviconRepository, ItemRepository, ListRepository } from "@/domain/repositories"
import { PrismaFaviconRepository } from "./prisma-favicon-repository"
import { PrismaItemRepository } from "./prisma-item-repository"
import { PrismaListRepository } from "./prisma-list-repository"

export function getListRepository(): ListRepository {
  return new PrismaListRepository()
}

export function getItemRepository(): ItemRepository {
  return new PrismaItemRepository()
}

export function getFaviconRepository(): FaviconRepository {
  return new PrismaFaviconRepository()
}
