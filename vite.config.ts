import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  base: "./",
  server: {
    host: true,
    port: 8100
  },
  plugins: [
    react(),
    tailwindcss(),

    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: [
                'better-sqlite3'   
              ],
              output: {
                format: 'cjs',
              },
            },
          },
        },
      },
      

      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          build: {
            rollupOptions: {
              external: [
                'better-sqlite3'   
              ],
              output: {
                format: 'cjs',
              },
            },
          },
        },
      },

      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    })

  ],
})
