import { NsisUpdater, MacUpdater, AppImageUpdater } from 'electron-updater';
import { app, dialog } from 'electron';
import * as isDev from 'electron-is-dev';
import log from '../utils/log';

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
  app.whenReady().then(() => {
    const clickId = dialog.showMessageBoxSync({
      type: 'info',
      title: '升级提示',
      message: '已为你下载到最新版，是否立即升级?',
      buttons: ['马上升级', '手动重启'],
      cancelId: 1,
    });
    if (clickId === 0) {
      autoUpdater.quitAndInstall();
      app.quit();
    }
  });
});

export function checkForUpdates() {
  if (isDev) {
    return;
  }

  return autoUpdater.checkForUpdates();
}

export default autoUpdater;

