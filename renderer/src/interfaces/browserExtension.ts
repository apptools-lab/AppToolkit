import { PackageInfo, VersionStatus } from './base';

export interface BrowserExtensionsInfo {
  id: string;
  title: string;
  versionStatus: keyof typeof VersionStatus;
  extensions: PackageInfo[];
}
