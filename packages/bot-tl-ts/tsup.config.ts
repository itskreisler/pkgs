import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'build',
  bundle: false,
  banner: {
    js: '//'
  },
  format: ['esm']
})
