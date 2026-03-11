import path from 'node:path'
import tailwind from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, mergeConfig, type UserConfig } from 'vite'

interface RepoViteConfigOptions extends UserConfig {
  appDir: string
}

export const createViteConfig = (options: RepoViteConfigOptions) => {
  const { appDir, ...overrides } = options

  return defineConfig((env) => {
    const { mode, command } = env
    const isProd = mode === 'prod' || mode === 'production'
    const isBuild = command === 'build'
    const envVars = loadEnv(mode, appDir)
    if (mode !== 'prod') {
      console.log(`🔍 [${path.basename(appDir)}] Loaded ${Object.keys(envVars).length} env vars`)
    }
    const label = path.basename(appDir).toUpperCase()

    const logStyles = {
      build: {
        bg: '\x1b[42m',
        text: '\x1b[1;30m',
        info: '\x1b[32m',
        icon: '📦',
        tag: 'BUILD',
      },
      serve: {
        bg: '\x1b[44m',
        text: '\x1b[1;37m',
        info: '\x1b[34m',
        icon: '🚀',
        tag: 'DEV',
      },
    }

    const style = isBuild ? logStyles.build : logStyles.serve

    console.log(
      `\n${style.bg}${style.text} ${style.icon} ${label} \x1b[0m ` +
        `${style.info}${style.tag} MODE: ${mode} | Command: ${command}\x1b[0m\n`,
    )

    const baseConfig: UserConfig = {
      root: appDir,
      base: envVars.VITE_APP_BASE || '/',
      plugins: [react(), tailwind()],
      // Ensure the resolution of third-party library compatibility boundaries
      define: {
        'process.env': JSON.stringify(envVars),
        ...Object.keys(envVars).reduce(
          (acc, key) => {
            acc[`process.env.${key}`] = JSON.stringify(envVars[key])
            return acc
          },
          {} as Record<string, string | undefined>,
        ),
      },
      resolve: {
        alias: [
          { find: '@', replacement: path.resolve(appDir, './src') },
          {
            find: /^@repo\/(.*)$/,
            replacement: path.resolve(appDir, '../../packages/$1/src'),
          },
        ],
      },
    }

    const envConfig: UserConfig = isProd
      ? {
          build: {
            outDir: 'dist',
            minify: isProd,
            sourcemap: !isProd,
            emptyOutDir: true, // Ensure the custom path will be cleared
            rolldownOptions: {
              output: {
                manualChunks(id) {
                  if (id.includes('node_modules')) {
                    if (id.includes('react')) return 'vendor-react'
                    return 'vendor-utils'
                  }
                },
              },
            },
          },
        }
      : {
          server: {
            port: 3000,
            strictPort: true,
            host: true,
          },
        }

    const mergedBase = mergeConfig(baseConfig, envConfig)

    return mergeConfig(mergedBase, overrides)
  })
}
