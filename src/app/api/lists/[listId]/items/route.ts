import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { getItemRepository, getListRepository } from "@/infrastructure/db"

const createItemSchema = z.object({
  content: z.string().min(1).max(2000),
  url: z.string().url().max(2000).optional(),
})

type RouteContext = {
  params: Promise<{ listId: string }>
}

export async function POST(req: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { listId } = await context.params

  // Verify ownership
  const listRepo = getListRepository()
  const list = await listRepo.findById(listId)
  if (!list || list.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = createItemSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const itemRepo = getItemRepository()
  const items = await itemRepo.findAllByList(listId)
  const nextPosition = items.length > 0 ? Math.max(...items.map((i) => i.position)) + 1 : 0

  const item = await itemRepo.create(listId, {
    ...parsed.data,
    position: nextPosition,
  })

  return NextResponse.json(item, { status: 201 })
}
