import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    example: 'src/example.ts'
  },
  banner: {
    js: '// @buymeacoffee https://www.buymeacoffee.com/kreisler'
  },
  format: ['cjs']
})