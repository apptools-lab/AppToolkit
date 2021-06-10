export interface IBasePackageInfo {
  title: string;
  name: string;
  description: string;
  icon: string;
  downloadUrl?: string;
  shellName?: string;
  version: string | null;
  recommended: boolean;
  isInternal: boolean;
  type: PackageType;
  platforms?: Platform;
  options?: {
    [k: string]: any;
  };
}

export type Platform = [
  'aix',
  'android',
  'darwin',
  'freebsd',
  'linux',
  'openbsd',
  'sunos',
  'win32',
  'cygwin',
  'netbsd'
];

export type PackageType = 'cli' | 'dmg' | 'exe' | 'IDEExtension' | 'npm';

export type VersionStatus = 'installed' | 'uninstalled' | 'upgradeable';

export interface ILocalPackageInfo {
  localVersion: string | null;
  versionStatus: VersionStatus;
  localPath?: string | null;
  warningMessage?: string;
  [key: string]: any;
}
export interface INodeVersionManagerInfo {
  managerPath: string | null;
  managerVersion: string | null;
}

export interface IPackageInfo extends IBasePackageInfo, ILocalPackageInfo { }

export interface INodeManager {
  installNode: Function;
}

export interface IPackageInstaller {
  install: (packageInfo: IPackageInfo, packagePath?: string) => Promise<{ name: string; localPath: null | string }>;
}

export interface IInstallResult {
  title: string;
  duration: number;
  status: 'finish' | 'error';
  errMsg?: string;
}

export interface INodeVersions {
  versions: string[];
  majors: Array<{ version: string; title: string }>;
}
