export interface IAppCard {
  name: string;
  description: string;
  icon: string;
  recommended?: boolean;
  versionStatus: 'installed' | 'notInstalled' | 'upgradeable';
  showSplitLine?: boolean;
}

export interface IBasePackage {
  name: string;
  title: string;
  description: string;
  icon: string;
  url?: string;
  managerName?: string;
  recommended: boolean;
  isInternal: boolean;
  type: 'node' | 'tool' | 'app';
  version: string | null;
  path: string | null;
  versionStatus: 'installed' | 'notInstalled' | 'upgradeable';
}

export enum VersionStatus {
  'installed' = '已安装',
  'notInstalled' = '未安装',
  'upgradeable' = '可升级'
}
