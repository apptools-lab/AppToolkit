import { join } from 'path';
import { builtinModules } from 'module';

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '@': `${join(PACKAGE_ROOT, 'src')}`,
    },
  },
  build: {
    sourcemap: 'inline',
    target: 'node16',
    outDir: join(__dirname, 'build'),
    assetsDir: '.',
    minify: process.env.NODE_NEV === 'development',
    lib: {
      entry: join(__dirname, 'src', 'index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [
        'electron',
        'electron-devtools-installer',
        ...builtinModules,
        'node:url',
        'node:stream',
        'node:fs',
        'node:path',
        'node:util',
        'node:buffer',
        'node:net',
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
