import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    createapi: 'src/lib/index.ts'
  },
  banner: {
    js: '// @ts-check'
  },
  format: ['cjs', 'esm'],
  // external: ['react'],
  dts: true
})
