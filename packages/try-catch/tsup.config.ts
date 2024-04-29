import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    '.': 'src/index.ts',
  },
  banner: {
    js: `// First line`,
  },
  format: ['cjs', 'esm'],
  //external: ['react'],
  dts: true,
});
