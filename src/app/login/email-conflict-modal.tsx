"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function EmailConflictModal({ providers }: { providers: string | null }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (providers && searchParams.get("emailConflict")) {
      setIsOpen(true)
    }
  }, [providers, searchParams])

  if (!isOpen || !providers) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 dark:bg-zinc-900">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Account Already Exists</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          An account with this email already exists. Please sign in using{" "}
          <span className="font-medium">{providers.replace(/,/g, " or ")}</span>.
        </p>
        <button
          onClick={() => {
            setIsOpen(false)
            router.push("/login")
          }}
          className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
