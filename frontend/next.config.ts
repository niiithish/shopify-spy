import type { NextConfig } from "next"
import { loadEnvConfig, updateInitialEnv } from "@next/env"
import path from "path"

/**
 * Shared monorepo env: repo-root `.env` (same file as backend).
 *
 * Next.js calls `loadEnvConfig(projectDir)` *before* evaluating this file, so a
 * second non-forced `loadEnvConfig(monorepoRoot)` is a no-op (module cache).
 * Force-load the root file, then pin those keys into Next's `initialEnv` so
 * later env reloads (and a frontend pass) do not drop them.
 */
const monorepoRoot = path.resolve(process.cwd(), "..")
const isDev = process.env.NODE_ENV !== "production"
const silentLog = {
  info: () => {},
  warn: () => {},
  error: (...args: unknown[]) => console.error(...args),
}

const { parsedEnv } = loadEnvConfig(monorepoRoot, isDev, silentLog, true)
if (parsedEnv && Object.keys(parsedEnv).length > 0) {
  updateInitialEnv(parsedEnv)
}

// Frontend-local overrides (.env.local, etc.) if present
loadEnvConfig(process.cwd(), isDev, silentLog, true)

const nextConfig: NextConfig = {}

export default nextConfig
