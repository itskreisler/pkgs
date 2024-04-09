import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    '.': 'src/index.ts',
  },
  banner: {
    js: `/**
* @kreisler/dirname-for-module v2.0.0
* Author: kreisler <tempkreisler@outlook.com> (https://github.com/itskreisler)
* Homepage: https://github.com/itskreisler/dirname-for-module#readme
* Released under the MIT License.
*/`,
  },
  format: ['esm'],
  //external: ['react'],
  dts: true,
});
