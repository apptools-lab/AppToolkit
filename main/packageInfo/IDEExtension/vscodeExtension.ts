import * as execa from 'execa';
import isCliInstalled from '../../utils/isCliInstalled';
import { VSCODE_CLI_COMAMND_NAME } from '../../constants';
import { ILocalPackageInfo } from '../../types';

function getVSCodeExtensionInfo(name: string) {
  const extensionInfo: ILocalPackageInfo = {
    versionStatus: 'uninstalled',
    localVersion: null,
  };
  if (isCliInstalled(VSCODE_CLI_COMAMND_NAME)) {
    const { stdout } = execa.sync(
      VSCODE_CLI_COMAMND_NAME,
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
