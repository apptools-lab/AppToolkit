export interface IBasePackage {
  title: string;
  name: string;
  description: string;
  icon: string;
  downloadUrl: string;
  version: string;
  recommended: boolean;
  isInternal: boolean;
  type: 'tool' | 'app';
}
