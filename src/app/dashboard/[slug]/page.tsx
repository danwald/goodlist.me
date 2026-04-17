import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getListRepository } from "@/infrastructure/db"
import { AddItemForm } from "./add-item-form"
import { ItemRow } from "./item-row"
import { ShareButton } from "@/components/share-button"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ListDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { slug } = await params
  const listRepo = getListRepository()
  const list = await listRepo.findByOwnerAndSlug(session.user.id, slug)

  if (!list) redirect("/dashboard")

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            &larr; Back
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{list.title}</h1>
            {list.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{list.description}</p>
            )}
          </div>
          {list.isPublic && (
            <ShareButton
              url={`${process.env.NEXTAUTH_URL}/list/${list.id}`}
            />
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <AddItemForm listId={list.id} />

        {list.items.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-zinc-500 dark:text-zinc-400">
              No items yet. Add your first one above!
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-2">
            {list.items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
