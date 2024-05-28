import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    createapi: 'src/lib/index.ts'
  },
  banner: {
    js: '// @buymeacoffee https://www.buymeacoffee.com/kreisler'
  },
  format: ['cjs', 'esm'],
  // external: ['react'],
  dts: true
})
