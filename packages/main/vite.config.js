import { join, resolve } from 'path';
import { builtinModules } from 'module';
import commonjs from '@rollup/plugin-commonjs';

const PACKAGE_ROOT = resolve();

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '/@/': `${join(PACKAGE_ROOT, 'src')}/`,
    },
  },
  build: {
    sourcemap: 'inline',
    target: 'node16',
    outDir: join(__dirname, 'build'),
    assetsDir: '.',
    minify: false,
    lib: {
      entry: join(__dirname, 'src', 'index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      treeshake: {
        propertyReadSideEffects: false,
      },
      // plugins: [commonjs({ include: ['shell'] })],
      external: [
        'electron',
        'electron-devtools-installer',
        ...builtinModules,
        'node:url',
        'node:stream',
        'node:fs',
        'node:path',
      ],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
    emptyOutDir: true,
    brotliSize: false,
  },
};

export default config;
