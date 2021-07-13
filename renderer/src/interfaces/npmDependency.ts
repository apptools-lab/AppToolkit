export interface INpmDependency {
  name: string;
  type: string;
  currentVersion: string;
  latestVersion: string;
}

export interface ISearchNpmDependency {
  name: string;
  version: string;
  repository: string;
}
