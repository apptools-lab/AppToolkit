import { NsisUpdater, MacUpdater, AppImageUpdater } from 'electron-updater';
import { app } from 'electron';
import fetch from 'node-fetch';
import log from '../utils/log';
import { createUpdaterWindow, sendToUpdaterWindow } from '../window';

const { version: currentVersion } = require('../../package.json');

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
  const { version: latestVersion } = info;
  app.whenReady()
    .then(() => {
      return createUpdaterWindow();
    })
    .then(() => {
      return fetchChangelog(latestVersion);
    })
    .then((changelog) => {
      sendToUpdaterWindow('update-info', {
        currentVersion,
        latestVersion,
        changelog,
      });
    })
    .catch((e) => {
      log.error(e);
    });
});

export function checkForUpdates() {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  return autoUpdater.checkForUpdates();
}

async function fetchChangelog(version: string) {
  const res = await fetch(`https://iceworks.oss-cn-hangzhou.aliyuncs.com/toolkit/changelog/${version}.json`);
  const content = await res.json();
  return content;
}

export default autoUpdater;
