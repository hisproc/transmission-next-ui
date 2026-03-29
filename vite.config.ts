import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(() => {
  const isDemo = process.env.VITE_APP_DEMO === 'true'

  return {
    base: "./",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        // If it's a demo build, replace rpc-client with mock version (specific first)
        ...(isDemo ? [
          { find: "@/lib/rpc-client", replacement: path.resolve(__dirname, "./src/lib/rpc-client-mock.ts") },
        ] : []),
        { find: "@", replacement: path.resolve(__dirname, "./src") },
      ],
    },
    server: {
      proxy: {
        "/transmission": {
          target: "http://127.0.0.1:9091",
          changeOrigin: true,
        },
      },
    },
  }
})
