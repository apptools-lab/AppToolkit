export interface BasePackageInfo {
  title: string;
  id: string;
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
  packagePath?: string;
}
export interface NodeVersionManagerInfo {
  managerVersionStatus: VersionStatus;
}

export interface PackageInfo extends BasePackageInfo, LocalPackageInfo { }

export interface NodeManager {
  installNode: Function;
}

export interface IPackageManager {
  install: (packageInfo: PackageInfo, packagePath?: string) => Promise<{ id: string; localPath?: string }>;
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

export interface BrowserExtensionInfo {
  category: string;
  title: string;
  extensions: BasePackageInfo[];
}

export interface PackagesData {
  bases: BasePackageInfo[];

  apps: AppInfo[];

  npmRegistries: NPMRegistry[];

  browserExtensions: BrowserExtensionInfo[];
}

export interface AddUserConfig {
  configName: string;
  SSHPublicKey: string;
  user: { name: string; email: string; hostName: string };
}

export interface UserGitConfig {
  SSHPublicKey: string;
  configName: string;
  gitDirs: string[];
  user: { name: string; email: string; hostName: string };
}

export interface InstalledDependency {
  version: string;
  from?: string;
  resolved?: string;
}

export interface InstalledDependencies {
  dependencies: {[key: string]: InstalledDependency};
}
