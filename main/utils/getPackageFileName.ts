import * as path from 'path';
import { PackageInfo } from '../types';

function getPackageFileName(packageInfo: PackageInfo) {
  const { title, version, downloadUrl } = packageInfo;
  const extname = path.extname(downloadUrl);
  // e.g: Google Chrome.dmg / Git-2.31.0.dmg
  const packageFileName = `${title}${version ? `-${version}` : ''}${extname}`;
  return packageFileName;
}

export default getPackageFileName;
