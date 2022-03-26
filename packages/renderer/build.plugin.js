const { build } = require('vite');
const { spawn } = require('child_process');
const electronPath = require('electron');
const { join } = require('path');

const preloadPackageConfigFile = join(__dirname, '..', 'preload', 'vite.config.js');
const mainPackageConfigFile = join(__dirname, '..', 'main', 'vite.config.js');

module.exports = ({ onHook }) => {
  onHook('after.start.devServer', async ({ devServer }) => {
    try {
      await setupPreloadPackageWatcher(devServer);
      await setupMainPackageWatcher(devServer);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

  onHook('after.build.compile', async () => {
    try {
      await buildPackage(preloadPackageConfigFile);
      await buildPackage(mainPackageConfigFile);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });
};

function getWatcher({ name, configFile, writeBundle }) {
  return build({
    mode: 'development',
    build: {
      watch: {},
    },
    configFile,
    plugins: [{ name, writeBundle }],
  });
}

function setupPreloadPackageWatcher(devServer) {
  return getWatcher({
    name: 'reload-page-on-preload-package-change',
    configFile: preloadPackageConfigFile,
    writeBundle() {
      devServer.ws.send({
        type: 'full-reload',
      });
    },
  });
}

function setupMainPackageWatcher(devServer) {
  const protocol = `http${devServer.config.server.https ? 's' : ''}:`;
  const host = 'localhost';
  const { port } = devServer.config.server;
  const RENDERER_DEV_SERVER_URL = `${protocol}//${host}:${port}/`;

  let spawnProcess = null;

  return getWatcher({
    name: 'reload-app-on-main-process-change',
    configFile: mainPackageConfigFile,
    writeBundle() {
      if (spawnProcess !== null) {
        spawnProcess.kill('SIGINT');
        spawnProcess = null;
      }

      spawnProcess = spawn(String(electronPath), ['.'], {
        env: {
          ...process.env,
          RENDERER_DEV_SERVER_URL,
        },
      });

      spawnProcess.stdout.on('data', (chunk) => {
        const data = chunk.toString().trim();
        if (!data) return;
        console.error(data);
      });

      spawnProcess.stderr.on('data', (chunk) => {
        const data = chunk.toString().trim();
        if (!data) return;
        console.error(data);
      });
    },
  });
}

function buildPackage(configFile) {
  return build({ configFile, mode: 'production' });
}
