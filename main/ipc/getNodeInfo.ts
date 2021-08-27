import { ipcMain } from 'electron';
import getNodeVersions from '../utils/getNodeVersions';
import { getPackageInfo } from '../packageInfo';
import { BasePackageInfo } from '../types';
import store, { packagesDataKey } from '../store';

export default () => {
  ipcMain.handle('get-node-info', () => {
    const data = store.get(packagesDataKey);
    const { bases = [] }: { bases: BasePackageInfo[] } = data;
    const nodeBasicInfo = bases.find((base: BasePackageInfo) => base.id === 'node');
    const nodeInfo = getPackageInfo(nodeBasicInfo);

    return nodeInfo;
  });

  ipcMain.handle('get-node-versions', async () => {
    return await getNodeVersions();
  });
};
