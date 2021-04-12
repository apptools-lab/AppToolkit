export interface IBaseEnv {
  name: string;
  description: string;
  icon: string;
  url: string;
  version: string;
  recommended: boolean;
  isInternal: boolean;
  type: 'tool' | 'app';
}
