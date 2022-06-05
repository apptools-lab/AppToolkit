import PackageManager from './PackageManager';

export default class ExePackageManager extends PackageManager {
  async install(id: string, downloadLink: string) {
    return {
      success: true,
      message: '',
    };
  }

  async uninstall(id: string) {
    return {
      success: true,
      message: '',
    };
  }
}