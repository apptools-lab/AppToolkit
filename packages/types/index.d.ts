export interface IElectronAPI {
  openFile: () => Promise<undefined | string>;
}

