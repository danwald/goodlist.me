// AIDEV-NOTE: NextAuth config — credentials (email/password) + Google + GitHub OAuth
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email, image: user.image }
      },
    }),
  ],
  callbacks: {
    // AIDEV-NOTE: detect email conflicts between OAuth providers
    async signIn({ user, account }) {
      console.log("[signIn] account?.provider:", account?.provider, "user.email:", user.email)

      if (!account || !["google", "github"].includes(account.provider)) {
        console.log("[signIn] Skipping: no account or not google/github")
        return true
      }

      if (!user.email) {
        console.log("[signIn] Skipping: no user.email")
        return true
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { accounts: { select: { provider: true } } },
      })

      console.log("[signIn] existingUser:", existingUser ? { id: existingUser.id, email: existingUser.email, accountCount: existingUser.accounts.length } : null)

      if (!existingUser) {
        console.log("[signIn] Skipping: user doesn't exist in DB")
        return true
      }

      const linkedProviders = existingUser.accounts.map((a) => a.provider)
      console.log("[signIn] linkedProviders:", linkedProviders, "currentProvider:", account.provider)

      if (linkedProviders.length > 0 && !linkedProviders.includes(account.provider)) {
        // User exists with different provider(s) — pass error in URL
        const providerList = linkedProviders.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(",")
        const encodedProviders = encodeURIComponent(providerList)
        console.log("[signIn] CONFLICT DETECTED! providers:", providerList)
        return `/login?emailConflict=true&providers=${encodedProviders}`
      }

      console.log("[signIn] No conflict, allowing sign in")
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
