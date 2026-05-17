import { getEmailConflictError } from "@/lib/auth"
import LoginForm from "./login-form"

type Props = {
  searchParams: Promise<{ emailConflict?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  const conflictId = params.emailConflict
  const providers = conflictId ? getEmailConflictError(conflictId) : null

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Welcome back to goodlist.me
          </p>
        </div>

        <LoginForm providers={providers} conflictId={conflictId} />
      </div>
    </div>
  )
}
