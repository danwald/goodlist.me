// AIDEV-NOTE: sets dummy env vars before test modules import src/lib/auth.ts,
// since NextAuth/Prisma config reads these at module-load time.
import "@testing-library/jest-dom/vitest"

process.env.NEXTAUTH_SECRET ??= "test-nextauth-secret"
process.env.GOOGLE_CLIENT_ID ??= "test-google-client-id"
process.env.GOOGLE_CLIENT_SECRET ??= "test-google-client-secret"
process.env.GITHUB_CLIENT_ID ??= "test-github-client-id"
process.env.GITHUB_CLIENT_SECRET ??= "test-github-client-secret"
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test"
