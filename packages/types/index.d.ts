export interface IElectronAPI {
  openFile: () => Promise<undefined | string>;

  getPlatform: () => NodeJS.Platform;
}

