import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  banner: {
    js: '// @buymeacoffee https://www.buymeacoffee.com/kreisler'
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  clean: true,
})
