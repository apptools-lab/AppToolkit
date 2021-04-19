export interface IBasicPackageInfo {
  title: string;
  name: string;
  description: string;
  icon: string;
  downloadUrl: string;
  version: string;
  recommended: boolean;
  isInternal: boolean;
  type: keyof typeof PACKAGE_TYPE;
  platform: Platform;
  options?: {
    [k: string]: any;
  };
}

export type Platform = 'win32' | 'darwin';

export enum PACKAGE_TYPE {
  'cmd',
  'dmg',
  'exe',
  'vscodeExtension',
  'chromeExtension',
  'npm'
}

export enum VERSION_STATUS {
  'installed',
  'notInstalled',
  'upgradeable'
}

export interface ILocalPackageInfo {
  localVersion: string | null;
  localPath: string | null;
  versionStatus: keyof typeof VERSION_STATUS;
  warningMessage?: string;
  [key: string]: any;
}
export interface INodeVersionManagerInfo {
  managerPath: string | null;
  managerVersion: string | null;
}

export interface IPackageInfo extends IBasicPackageInfo, ILocalPackageInfo {}
