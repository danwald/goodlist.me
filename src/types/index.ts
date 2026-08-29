// AIDEV-NOTE: shared domain types — decoupled from Prisma so the app layer never imports Prisma directly

export type User = {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export type List = {
  id: string
  title: string
  description: string | null
  slug: string
  isPublic: boolean
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

// AIDEV-NOTE: pagination envelopes — plain domain shapes (no Prisma skip/take leakage here,
// that stays inside the infrastructure layer per the port/adapter split).
export type PaginatedLists = {
  lists: List[]
  total: number
}

export type PaginatedItems = {
  items: Item[]
  total: number
}

export type Item = {
  id: string
  content: string
  url: string | null
  position: number
  listId: string
  createdAt: Date
  updatedAt: Date
}

export type CreateListInput = {
  title: string
  description?: string
  slug: string
  isPublic?: boolean
}

export type UpdateListInput = {
  title?: string
  description?: string | null
  slug?: string
  isPublic?: boolean
}

export type CreateItemInput = {
  content: string
  url?: string
  position?: number
}

export type UpdateItemInput = {
  content?: string
  url?: string | null
  position?: number
}
