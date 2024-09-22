import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    tryCatch: 'src/lib/try-catch.ts',
    tryCatchFinally: 'src/lib/tryCatchFinally.ts',
    tryFinally: 'src/lib/tryFinally.ts',
    tryToCatch: 'src/lib/tryToCatch.ts'
  },
  banner: {
    js: '// @buymeacoffee https://www.buymeacoffee.com/kreisler'
  },
  format: ['cjs', 'esm'],
  // external: ['react'],
  dts: true
})
