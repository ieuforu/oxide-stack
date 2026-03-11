import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'api',
          root: './packages/api',
          environment: 'node',
          setupFiles: ['./test/setup.ts'],
          env: {
            DATABASE_URL: 'mysql://root:root@localhost:3306/test_db',
          },
        },
      },
    ],
  },
})
