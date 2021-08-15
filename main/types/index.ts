export interface BasePackageInfo {
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

export interface LocalPackageInfo {
  localVersion: string | null;
  versionStatus: VersionStatus;
  localPath?: string | null;
  warningMessage?: string;
  [key: string]: any;
}
export interface NodeVersionManagerInfo {
  managerVersionStatus: VersionStatus;
}

export interface PackageInfo extends BasePackageInfo, LocalPackageInfo { }

export interface NodeManager {
  installNode: Function;
}

export interface IPackageManager {
  install: (packageInfo: PackageInfo, packagePath?: string) => Promise<{ name: string; localPath?: string }>;
  uninstall?: (packageInfo: PackageInfo) => Promise<void>;
}

export interface InstallResult {
  title: string;
  duration: number;
  status: 'finish' | 'error';
  errMsg?: string;
}

export interface NodeVersions {
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
  packages: BasePackageInfo[];
}

export interface IDEExtension {
  category: string;
  title: string;
  extensions: BasePackageInfo[];
}

export interface PackagesData {
  bases: BasePackageInfo[];

  apps: AppInfo[];

  npmRegistries: NPMRegistry[];

  IDEExtensions: IDEExtension[];
}
