import path from "node:path"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

// AIDEV-NOTE: coverage.include is intentionally scoped to critical-logic files only
// (auth signIn callback, utils, Prisma repository adapters, DI factory). App Router
// pages/routes (src/app/**) are out of scope for this pass — see AGENTS.md.
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    // AIDEV-NOTE: next-auth's ESM build does `import ... from "next/server"` (no
    // extension). Node resolves this fine at runtime (next has no "exports" map,
    // so it falls back to legacy extension-searching), but Vite's resolver in this
    // Next.js 16 setup does not, so we alias it explicitly for the test env.
    alias: {
      "next/server": path.resolve(__dirname, "node_modules/next/server.js"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    server: {
      deps: {
        // AIDEV-NOTE: force next-auth/@auth/core through Vite's transform/resolve
        // pipeline (instead of being externalized to raw Node import) so the
        // "next/server" alias above actually applies. See note near the alias.
        inline: [/next-auth/, /@auth\/core/],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "src/lib/auth.ts",
        "src/lib/utils.ts",
        "src/infrastructure/db/prisma-list-repository.ts",
        "src/infrastructure/db/prisma-item-repository.ts",
        "src/infrastructure/db/prisma-favicon-repository.ts",
        "src/infrastructure/db/index.ts",
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
})
