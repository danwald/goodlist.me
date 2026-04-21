"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function RefreshFaviconsButton({ listId }: { listId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRefresh() {
    setLoading(true)
    try {
      await fetch(`/api/lists/${listId}/refresh-favicons`, { method: "POST" })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-zinc-50"
    >
      {loading ? "Refreshing…" : "Refresh icons"}
    </button>
  )
}
