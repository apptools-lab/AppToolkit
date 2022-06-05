import PackageManager from './PackageManager';

// VS Code 插件包管理
export default class VSIXPackageManager extends PackageManager {
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