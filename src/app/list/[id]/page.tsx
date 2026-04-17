import { notFound } from "next/navigation"
import Link from "next/link"
import { getListRepository } from "@/infrastructure/db"
import type { Item } from "@/types"

type Props = {
  params: Promise<{ id: string }>
}

// AIDEV-NOTE: Public read-only list view — no auth required.
// Returns 404 for both missing lists and private lists to avoid leaking existence.
export default async function PublicListPage({ params }: Props) {
  const { id } = await params
  const listRepo = getListRepository()
  const list = await listRepo.findById(id)

  if (!list || !list.isPublic) notFound()

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

        {list.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-zinc-500 dark:text-zinc-400">This list has no items yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {list.items.map((item: Item) => (
              <li
                key={item.id}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {item.content}
                  </a>
                ) : (
                  <span className="text-sm text-zinc-900 dark:text-zinc-50">{item.content}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
