"use client"

import { useRouter } from "next/navigation"
import type { Item } from "@/types"
import { MarkdownContent } from "@/components/markdown-content"

export function ItemRow({ item }: { item: Item }) {
  const router = useRouter()

  async function handleDelete() {
    await fetch(`/api/items/${item.id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <li className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <MarkdownContent
          content={item.content}
          className="truncate text-sm text-zinc-900 dark:text-zinc-50"
        />
      </div>
      <button
        onClick={handleDelete}
        className="ml-4 shrink-0 text-xs text-zinc-400 transition-colors hover:text-red-500"
      >
        Delete
      </button>
    </li>
  )
}
