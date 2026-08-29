import { notFound } from "next/navigation"
import Link from "next/link"
import { getItemRepository, getListRepository } from "@/infrastructure/db"
import { DEFAULT_ITEM_PAGE_SIZE } from "@/domain/repositories"
import type { Item } from "@/types"
import { MarkdownContent } from "@/components/markdown-content"
import { Pagination } from "@/components/pagination"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

// AIDEV-NOTE: Public read-only list view — no auth required.
// Returns 404 for both missing lists and private lists to avoid leaking existence.
export default async function PublicListPage({ params, searchParams }: Props) {
  const { id } = await params
  const searchParamsResolved = await searchParams
  const page = Math.max(1, Number(searchParamsResolved.page) || 1)

  const listRepo = getListRepository()
  const list = await listRepo.findById(id)

  if (!list || !list.isPublic) notFound()

  const itemRepo = getItemRepository()
  const { items, total } = await itemRepo.findPageByList(id, { page })
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_ITEM_PAGE_SIZE))

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            goodlist.me
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{list.title}</h1>
          {list.description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{list.description}</p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-zinc-500 dark:text-zinc-400">This list has no items yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item: Item) => (
              <li
                key={item.id}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <MarkdownContent
                  content={item.content}
                  className="text-sm text-zinc-900 dark:text-zinc-50"
                />
              </li>
            ))}
          </ul>
        )}

        <Pagination basePath={`/list/${id}`} page={page} totalPages={totalPages} />
      </main>
    </div>
  )
}
