/**
 * @swagger
 * /api/lists/{listId}:
 *   get:
 *     summary: Get a public list by ID
 *     tags: [Lists]
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the list
 *     responses:
 *       200:
 *         description: The public list with its items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       404:
 *         description: List not found or not public
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
import { NextResponse } from "next/server"
import { getListRepository } from "@/infrastructure/db"

type RouteContext = {
  params: Promise<{ listId: string }>
}

export async function GET(_req: Request, context: RouteContext) {
  const { listId } = await context.params
  const listRepo = getListRepository()
  const list = await listRepo.findById(listId)

  // AIDEV-NOTE: 404 for both missing and private lists to avoid leaking existence
  if (!list || !list.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(list)
}
