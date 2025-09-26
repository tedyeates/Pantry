import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react(), tailwindcss()],
    base: command === 'build' ? '/Pantry/' : '/',
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})