import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Try importing @cloudflare/vite-plugin with fallback if platform binary (workerd) is unavailable
let cloudflarePlugin: unknown = null
try {
  const { cloudflare } = await import("@cloudflare/vite-plugin")
  cloudflarePlugin = cloudflare()
} catch (e) {
  console.warn(
    "[vite.config.ts] Note: @cloudflare/vite-plugin skipped due to platform workerd binary constraint:",
    e instanceof Error ? e.message : e
  )
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(cloudflarePlugin
      ? [cloudflarePlugin as ReturnType<typeof import("@cloudflare/vite-plugin").cloudflare>]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
