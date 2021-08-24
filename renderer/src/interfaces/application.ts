import { PackageInfo } from './base';

export interface AppInfo {
  category: string;
  title: string;
  packages: PackageInfo[];
}

export interface ProcessStatus {
  status: string;
  name: string;
  currentIndex?: number;
  result?: any;
  errMsg?: string;
}
