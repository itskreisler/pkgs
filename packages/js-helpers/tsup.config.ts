import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    MarkdownWsp: 'src/lib/MarkdownWsp.ts',
    base64: 'src/lib/b64.ts',
    normalize: 'src/lib/normalize.ts',
    stripHtmlTags: 'src/lib/stripHtmlTags.ts',
    converter: 'src/lib/converter.ts',
    abbreviateNumber: 'src/lib/abbreviateNumber.ts'
  },
  banner: {
    js: '// @buymeacoffee https://www.buymeacoffee.com/kreisler'
  },
  format: ['cjs', 'esm'],
  // external: ['react'],
  dts: true
})
