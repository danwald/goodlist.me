import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { getListRepository } from "@/infrastructure/db"

const createListSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createListSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const listRepo = getListRepository()

  const existing = await listRepo.findByOwnerAndSlug(session.user.id, parsed.data.slug)
  if (existing) {
    return NextResponse.json({ error: "A list with this slug already exists" }, { status: 409 })
  }

  const list = await listRepo.create(session.user.id, parsed.data)
  return NextResponse.json(list, { status: 201 })
}
