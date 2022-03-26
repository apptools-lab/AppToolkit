import { join, resolve } from 'path';
import { builtinModules } from 'module';

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
    minify: process.env.MODE !== 'development',
    lib: {
      entry: join(__dirname, 'src', 'index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [
        'electron',
        'electron-devtools-installer',
        ...builtinModules,
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
