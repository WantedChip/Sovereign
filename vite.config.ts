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
  base: "/",
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
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor_react"
            }
            if (id.includes("@tiptap")) {
              return "vendor_tiptap"
            }
            if (
              id.includes("yjs") ||
              id.includes("y-indexeddb") ||
              id.includes("y-webrtc") ||
              id.includes("y-prosemirror")
            ) {
              return "vendor_yjs"
            }
            if (id.includes("cytoscape")) {
              return "vendor_cytoscape"
            }
            if (id.includes("@huggingface")) {
              return "vendor_transformers"
            }
          }
        },
      },
    },
  },
})
