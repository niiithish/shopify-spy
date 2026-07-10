import type { NextConfig } from "next"
import { loadEnvConfig } from "@next/env"
import path from "path"

// Shared monorepo env: load repo-root .env (same file as backend)
const monorepoRoot = path.resolve(process.cwd(), "..")
loadEnvConfig(monorepoRoot)
// Also allow frontend-local overrides if present
loadEnvConfig(process.cwd())

const nextConfig: NextConfig = {}

export default nextConfig
