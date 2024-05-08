import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    '.': 'src/index.ts',
  },
  banner: {
    js: `// @ts-check`,
  },
  format: ['cjs', 'esm'],
  //external: ['react'],
  dts: true,
});
