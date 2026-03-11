import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    name: 'api',
    environment: 'node',
    setupFiles: [fileURLToPath(new URL('./test/setup.ts', import.meta.url))],
    define: {
      'process.env.DATABASE_URL': JSON.stringify('mysql://root:password@localhost:3306/test_db'),
    },
  },
})
