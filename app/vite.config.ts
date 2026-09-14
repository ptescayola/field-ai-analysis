import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"
import { fileURLToPath } from "node:url"

const repoRoot = fileURLToPath(new URL("..", import.meta.url))

export default defineConfig({
  envDir: repoRoot,
  envPrefix: ["VITE_", "MAP_"],
  plugins: [vue()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
})
