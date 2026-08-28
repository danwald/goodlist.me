// AIDEV-NOTE: unit tests for auth.ts's provider config and callbacks. @/lib/prisma is
// mocked so no real DB is hit; we import the NextAuth config object directly.
import { describe, expect, it, vi } from "vitest"
import type { Mock } from "vitest"
import type { User } from "next-auth"
import type { AdapterUser } from "next-auth/adapters"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}))

// Import after the mocks so `auth.ts` picks up the mocked prisma/bcryptjs modules.
const { authConfig } = await import("@/lib/auth")
const { prisma } = await import("@/lib/prisma")
const bcrypt = (await import("bcryptjs")).default

const jwtCallback = authConfig.callbacks?.jwt
if (!jwtCallback) throw new Error("jwt callback not configured")

const sessionCallback = authConfig.callbacks?.session
if (!sessionCallback) throw new Error("session callback not configured")

const credentialsProvider = authConfig.providers.find(
  (p): p is typeof p & { options: { authorize: (creds: unknown) => Promise<unknown> } } =>
    "id" in p && p.id === "credentials",
)
if (!credentialsProvider) throw new Error("credentials provider not configured")
const authorize = credentialsProvider.options.authorize
if (!authorize) throw new Error("authorize not configured")

const findUniqueMock = vi.mocked(prisma.user.findUnique)
const compareMock = bcrypt.compare as unknown as Mock<(password: string, hash: string) => Promise<boolean>>

function makeUser(overrides: Partial<User | AdapterUser> = {}): User {
  return {
    id: "user-1",
    email: "person@example.com",
    name: "Person",
    image: null,
    ...overrides,
  } as User
}

describe("auth.ts provider config", () => {
  // AIDEV-NOTE: same email should map to the same application User across all auth
  // mechanisms — verifies the providers opt in to Auth.js's email-based account linking
  // (see the AIDEV-NOTE above the providers array in auth.ts for the security rationale).
  type ProviderWithOptions = { options: { allowDangerousEmailAccountLinking?: boolean } }

  it("enables allowDangerousEmailAccountLinking on the google provider", () => {
    const google = authConfig.providers.find((p) => "id" in p && p.id === "google")
    expect(google).toBeDefined()
    expect((google as unknown as ProviderWithOptions).options.allowDangerousEmailAccountLinking).toBe(true)
  })

  it("enables allowDangerousEmailAccountLinking on the github provider", () => {
    const github = authConfig.providers.find((p) => "id" in p && p.id === "github")
    expect(github).toBeDefined()
    expect((github as unknown as ProviderWithOptions).options.allowDangerousEmailAccountLinking).toBe(true)
  })
})

describe("auth.ts credentials authorize", () => {
  it("returns null when email or password is missing", async () => {
    expect(await authorize({ email: "", password: "pw" })).toBeNull()
    expect(await authorize({ password: "pw" })).toBeNull()
    expect(await authorize({ email: "a@example.com" })).toBeNull()
    expect(findUniqueMock).not.toHaveBeenCalled()
  })

  it("returns null when no user is found for the email", async () => {
    findUniqueMock.mockResolvedValueOnce(null)

    const result = await authorize({ email: "nobody@example.com", password: "pw" })

    expect(findUniqueMock).toHaveBeenCalledWith({ where: { email: "nobody@example.com" } })
    expect(result).toBeNull()
  })

  it("returns null when the user has no passwordHash (OAuth-only account)", async () => {
    findUniqueMock.mockResolvedValueOnce({ id: "user-1", passwordHash: null } as never)

    const result = await authorize({ email: "oauth@example.com", password: "pw" })

    expect(result).toBeNull()
    expect(compareMock).not.toHaveBeenCalled()
  })

  it("returns null when the password does not match", async () => {
    findUniqueMock.mockResolvedValueOnce({ id: "user-1", passwordHash: "hashed" } as never)
    compareMock.mockResolvedValueOnce(false)

    const result = await authorize({ email: "person@example.com", password: "wrong" })

    expect(compareMock).toHaveBeenCalledWith("wrong", "hashed")
    expect(result).toBeNull()
  })

  it("returns the user's public fields when the password matches", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "user-1",
      name: "Person",
      email: "person@example.com",
      image: null,
      passwordHash: "hashed",
    } as never)
    compareMock.mockResolvedValueOnce(true)

    const result = await authorize({ email: "person@example.com", password: "correct" })

    expect(result).toEqual({
      id: "user-1",
      name: "Person",
      email: "person@example.com",
      image: null,
    })
  })
})

describe("auth.ts jwt callback", () => {
  it("copies user.id onto the token when a user is present", async () => {
    const token = { sub: "abc" }
    const result = await jwtCallback({
      token,
      user: makeUser({ id: "user-1" }),
    } as Parameters<typeof jwtCallback>[0])

    expect(result).toMatchObject({ id: "user-1" })
  })

  it("leaves the token untouched when there is no user (token refresh)", async () => {
    const token = { sub: "abc" }
    const result = await jwtCallback({ token } as Parameters<typeof jwtCallback>[0])

    expect(result).toBe(token)
    expect(result).not.toHaveProperty("id")
  })
})

describe("auth.ts session callback", () => {
  it("copies token.id onto session.user.id when both are present", async () => {
    const session = { user: { email: "person@example.com" }, expires: "2099-01-01" }
    const result = await sessionCallback({
      session,
      token: { id: "user-1" },
    } as unknown as Parameters<typeof sessionCallback>[0])

    expect(result.user).toMatchObject({ id: "user-1" })
  })

  it("leaves the session untouched when there is no token.id", async () => {
    const session = { user: { email: "person@example.com" }, expires: "2099-01-01" }
    const result = await sessionCallback({
      session,
      token: {},
    } as unknown as Parameters<typeof sessionCallback>[0])

    expect(result).toBe(session)
  })

  it("leaves the session untouched when there is no session.user", async () => {
    const session = { expires: "2099-01-01" }
    const result = await sessionCallback({
      session,
      token: { id: "user-1" },
    } as unknown as Parameters<typeof sessionCallback>[0])

    expect(result).toBe(session)
  })
})
