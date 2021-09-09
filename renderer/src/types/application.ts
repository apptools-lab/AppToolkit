import { PackageInfo } from './base';

export interface AppInfo {
  id: string;
  title: string;
  packages: PackageInfo[];
}
