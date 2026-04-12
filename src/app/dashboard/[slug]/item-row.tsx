"use client"

import { useRouter } from "next/navigation"
import type { Item } from "@/types"

export function ItemRow({ item }: { item: Item }) {
  const router = useRouter()

  async function handleDelete() {
    await fetch(`/api/items/${item.id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <li className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="min-w-0 flex-1">
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
