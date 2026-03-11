import { createViteConfig } from '@repo/vite-config'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default createViteConfig({
  appDir: __dirname,
  server: {
    port: 5173,
  },
})
