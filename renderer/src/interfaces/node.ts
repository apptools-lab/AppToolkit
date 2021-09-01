
export interface INodeVersions {
  versions: string[];
  majors: Array<{ version: string; title: string }>;
}

export interface NPMRegistry {
  name: string;
  registry: string;
  isInternal: boolean;
  recommended?: boolean;
}
export interface INpmDependency {
  name: string;
  type: string;
  currentVersion: string;
  latestVersion: string;
}

export interface ISearchNpmDependency {
  name: string;
  version: string;
  homepage: string;
  isInstalled: boolean;
}
