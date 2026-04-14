/**
 * @swagger
 * /api/items/{itemId}:
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item to delete
 *     responses:
 *       200:
 *         description: Item deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found or not owned by user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getItemRepository, getListRepository } from "@/infrastructure/db"

type RouteContext = {
  params: Promise<{ itemId: string }>
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { itemId } = await context.params

  const itemRepo = getItemRepository()
  const item = await itemRepo.findById(itemId)
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Verify ownership via the parent list
  const listRepo = getListRepository()
  const list = await listRepo.findById(item.listId)
  if (!list || list.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await itemRepo.delete(itemId)
  return NextResponse.json({ ok: true })
}
