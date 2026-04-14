/**
 * @swagger
 * /api/lists:
 *   post:
 *     summary: Create a new list
 *     tags: [Lists]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, slug]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: My Reading List
 *               slug:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 pattern: ^[a-z0-9-]+$
 *                 example: my-reading-list
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Books I want to read
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: List created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Slug already exists for this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
