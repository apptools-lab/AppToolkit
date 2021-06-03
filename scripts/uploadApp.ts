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
  // record latest version for the auto-updater to work. e.g: latest-mac.yml
  const channelFile = `${channel}${channelExt}`;
  // package installer file with version. e.g: AppWorks Toolkit.dmg
  const packageWithoutVersionFile = `${productName}${distFileExt}`;
  // package installer file with version. e.g: AppWorks Toolkit-0.1.0.dmg
  const packageWithVersionFile = `${distFileName}${distFileExt}`;
  // package zip file. e.g: AppWorks Toolkit-0.1.0-mac.zip
  const packageZipFile = `${distFileName}-${platform}.zip`;

  const fileLists = [
    { ossObjectFile: channelFile, localFile: channelFile },
    { ossObjectFile: packageWithoutVersionFile, localFile: packageWithVersionFile },
    { ossObjectFile: packageWithVersionFile, localFile: packageWithVersionFile },
    { ossObjectFile: packageZipFile, localFile: packageZipFile },
  ];
  await Promise.all(
    fileLists.map(({ ossObjectFile, localFile }) => {
      return uploadToOSS(`${OSSObjectDir}/${ossObjectFile}`, path.join(buildResourcesDir, localFile));
    }),
  );
})();
