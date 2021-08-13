export interface PackageInfo {
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
  platforms?: Platforms;
  options?: {
    [k: string]: any;
  };
}

export type Platform = 'darwin' | 'win32';

export type Platforms = ['darwin', 'win32'];

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
  managerVersionStatus: VersionStatus;
}

export interface IPackageInfo extends PackageInfo, ILocalPackageInfo { }

export interface INodeManager {
  installNode: Function;
}

export interface IPackageInstaller {
  install: (packageInfo: IPackageInfo, packagePath?: string) => Promise<{ name: string; localPath?: string }>;
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

export interface NPMRegistry {
  name: string;
  registry: string;
  recommended?: boolean;
  isInternal: boolean;
}

export interface AppInfo {
  category: string;
  title: string;
  packages: PackageInfo[];
}

export interface PackagesData {
  bases: PackageInfo[];

  apps: AppInfo[];

  npmRegistries: NPMRegistry[];
}
