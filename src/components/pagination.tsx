import Link from "next/link"

// AIDEV-NOTE: shared prev/next page-number pagination control. Server Component (plain
// <Link href="?page=N"> — no client interactivity needed), reused by the dashboard lists
// view and both items views (owner + public). Renders nothing when there's only one page.
type Props = {
  basePath: string
  page: number
  totalPages: number
}

export function Pagination({ basePath, page, totalPages }: Props) {
  if (totalPages <= 1) return null

  return (
    <nav className="mt-6 flex items-center justify-center gap-4">
      <Link
        href={`${basePath}?page=${page - 1}`}
        aria-disabled={page <= 1}
        className={`text-sm transition-colors ${
          page <= 1
            ? "pointer-events-none text-zinc-300 dark:text-zinc-700"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        }`}
      >
        &larr; Previous
      </Link>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Page {page} of {totalPages}
      </span>
      <Link
        href={`${basePath}?page=${page + 1}`}
        aria-disabled={page >= totalPages}
        className={`text-sm transition-colors ${
          page >= totalPages
            ? "pointer-events-none text-zinc-300 dark:text-zinc-700"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        }`}
      >
        Next &rarr;
      </Link>
    </nav>
  )
}
