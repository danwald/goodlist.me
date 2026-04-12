<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# goodlist.me

Fullstack curated-lists app. Next.js 16 (App Router) + Prisma 7 + PostgreSQL + NextAuth.js v5.

## Architecture

Repository pattern with swappable data layer:

| Layer | Location | Purpose |
|-------|----------|---------|
| Domain | `src/domain/repositories/` | Port interfaces (TS interfaces) |
| Infrastructure | `src/infrastructure/db/` | Prisma implementations |
| DI Wiring | `src/infrastructure/db/index.ts` | Factory functions — swap adapters here |
| Types | `src/types/index.ts` | Shared domain types (decoupled from Prisma) |

**Key rule**: Application code (`src/app/`, `src/components/`) imports from `@/domain/repositories` and `@/infrastructure/db` (factory), never from `@/generated/prisma` directly. Only `src/lib/prisma.ts` and the infrastructure layer touch Prisma.

## Prisma 7 Notes

- Client generated to `src/generated/prisma/` (gitignored)
- Import from `@/generated/prisma/client` (not `@prisma/client`)
- Requires `@prisma/adapter-pg` — see `src/lib/prisma.ts`
- Config in `prisma.config.ts` (not in schema)
- Run `npx prisma generate` after schema changes

## Auth

NextAuth.js v5 (beta) with:
- Credentials (email/password with bcrypt)
- Google OAuth
- GitHub OAuth
- JWT strategy, Prisma adapter for user storage

## Commands

```bash
make up          # Start Docker (app + postgres)
make down        # Stop Docker
make db-migrate  # Run Prisma migrations
make db-push     # Push schema without migration
make logs        # Tail all logs
make lint        # ESLint
make typecheck   # tsc --noEmit
```
