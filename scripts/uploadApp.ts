import * as path from 'path';
import uploadToOSS from './uploadToOSS';
const packageJSON = require('../package.json');

const isMac = process.platform === 'darwin';

const { build: { productName }, version } = packageJSON;

(async function () {
  const channel = 'latest';

  let channelExt = '';
  let OSSObjectDir = 'toolkit';
  // e.g: AppWorks Toolkit-0.1.0
  let distFileName = '';
  // e.g: .dmg .exe
  let distFileExt = '';
  // e.g.: mac win
  let platform = '';
  if (isMac) {
    channelExt = '-mac.yml';
    platform = 'mac';
    OSSObjectDir = `${OSSObjectDir}/${platform}`;
    distFileName = `${productName}-${version}`;
    distFileExt = '.dmg';
  }
  const buildResourcesDir = path.join(__dirname, '..', 'release');
  // upload app resource
  // 软件内获取的版本最新版本信息，用于升级软件 e.g: latest-mac.yml
  const channelFile = `${channel}${channelExt}`;
  // 软件安装包 e.g: AppWorks Toolkit-0.1.0.dmg
  const packageFile = `${distFileName}${distFileExt}`;
  // 软件压缩包 e.g: AppWorks Toolkit-0.1.0-mac.zip
  const packageZipFile = `${distFileName}-${platform}.zip`;

  Promise.all([
    [channelFile, packageFile, packageZipFile].map((file: string) => uploadToOSS(`${OSSObjectDir}/${file}`, path.join(buildResourcesDir, file))),
  ]);
})();
