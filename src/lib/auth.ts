// AIDEV-NOTE: NextAuth config — credentials (email/password) + Google + GitHub OAuth.
// config is extracted to a named, exported constant (rather than passed inline to
// NextAuth()) so unit tests can import `authConfig` directly.
import NextAuth, { type NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    // AIDEV-NOTE: allowDangerousEmailAccountLinking maps a sign-in to the existing User
    // row with the same email (whether that user was created via credentials or the other
    // OAuth provider) instead of Auth.js's default OAuthAccountNotLinked error — see
    // node_modules/@auth/core/lib/actions/callback/handle-login.js. Auth.js calls this
    // "dangerous" because it trusts the provider's email claim without re-verifying it here;
    // we accept that because completing a real OAuth flow with a provider is itself proof of
    // control over that email address (both Google and GitHub verify email ownership before
    // issuing it via OAuth). This is intentionally one-directional: it does NOT extend to the
    // credentials registration form (see src/app/api/register/route.ts), because typing an
    // email into a form proves nothing about who controls it — auto-attaching a password to
    // someone else's existing OAuth account that way would be an account-takeover vector.
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
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
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
