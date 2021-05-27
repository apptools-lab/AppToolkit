import { NsisUpdater, MacUpdater, AppImageUpdater } from 'electron-updater';
import * as isDev from 'electron-is-dev';
import log from './log';

let AutoUpdater;
if (process.platform === 'win32') {
  AutoUpdater = NsisUpdater;
} else if (process.platform === 'darwin') {
  AutoUpdater = MacUpdater;
} else {
  AutoUpdater = AppImageUpdater;
}

const autoUpdater = new AutoUpdater();

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.on('checking-for-update', () => {
  log.info('checking-for-update');
});
autoUpdater.on('update-available', (info) => {
  log.info('update-available', info);
});
autoUpdater.on('update-not-available', (info) => {
  log.info('update-not-available', info);
});
autoUpdater.on('error', (error) => {
  log.error('error', error);
});
autoUpdater.on('download-progress', (meta) => {
  log.info('download-progress', meta);
});
autoUpdater.on('update-downloaded', (info) => {
  log.info('update-downloaded', info);
});

export function checkForUpdates() {
  if (isDev) {
    return;
  }
  autoUpdater.checkForUpdates();
}

export default autoUpdater;

