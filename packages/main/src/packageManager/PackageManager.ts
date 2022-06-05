/**
 * 对工具应用进行操作，包括应用的安装/卸载
 */

interface Result {
  success: boolean;
  message: string;
  id: string;
}

abstract class PackageManager {
  // TODO: type
  abstract install(id: string, downloadLink: string): Promise<Result>;

  abstract uninstall(id: string): Promise<Result>;
}

export default PackageManager;
