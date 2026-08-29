/**
 * @swagger
 * /api/lists/{listId}:
 *   get:
 *     summary: Get a public list by ID (items are paginated)
 *     tags: [Lists]
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the list
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 1-indexed page of items to return
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of items per page (clamped to 100)
 *     responses:
 *       200:
 *         description: The public list, with one paginated page of its items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListPage'
 *       404:
 *         description: List not found or not public
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
import { NextResponse } from "next/server"
import { getItemRepository, getListRepository } from "@/infrastructure/db"
import { DEFAULT_ITEM_PAGE_SIZE } from "@/domain/repositories"

// AIDEV-NOTE: clamp pageSize so callers can't force an unbounded fetch via query params
const MAX_ITEM_PAGE_SIZE = 100

type RouteContext = {
  params: Promise<{ listId: string }>
}

export async function GET(req: Request, context: RouteContext) {
  const { listId } = await context.params
  const listRepo = getListRepository()
  const list = await listRepo.findById(listId)

  // AIDEV-NOTE: 404 for both missing and private lists to avoid leaking existence
  if (!list || !list.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const url = new URL(req.url)
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1)
  const pageSize = Math.min(
    MAX_ITEM_PAGE_SIZE,
    Math.max(1, Number(url.searchParams.get("pageSize")) || DEFAULT_ITEM_PAGE_SIZE),
  )

  const itemRepo = getItemRepository()
  const { items, total } = await itemRepo.findPageByList(listId, { page, pageSize })

  return NextResponse.json({ ...list, items, page, pageSize, total })
}
