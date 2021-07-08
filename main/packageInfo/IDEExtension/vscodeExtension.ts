import * as execa from 'execa';
import checkCommandInstalled from '../../utils/checkCommandInstalled';
import { VSCODE_COMMAND_NAME } from '../../constants';
import { ILocalPackageInfo } from '../../types';

async function getVSCodeExtensionInfo(name: string) {
  const extensionInfo: ILocalPackageInfo = {
    versionStatus: 'uninstalled',
    localVersion: null,
  };
  if (checkCommandInstalled(VSCODE_COMMAND_NAME)) {
    const { stdout } = await execa(
      VSCODE_COMMAND_NAME,
      ['--list-extensions', '--show-versions'],
    );
    if (stdout && typeof stdout === 'string') {
      const extensionsList = stdout.split('\n');
      const localExtensionInfo = extensionsList.find((ext: string) => (new RegExp(`${name}@`)).test(ext));
      if (localExtensionInfo) {
        const [, version] = localExtensionInfo.split('@');
        extensionInfo.localVersion = version;
        extensionInfo.versionStatus = 'installed';
      }
    }
  }

  return extensionInfo;
}

export default getVSCodeExtensionInfo;
