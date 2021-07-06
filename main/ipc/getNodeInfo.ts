import { ipcMain } from 'electron';
import getNodeVersions from '../utils/getNodeVersions';
import { getPackageInfo } from '../packageInfo';
import { IBasePackageInfo } from '../types';
import store, { packagesDataKey } from '../store';

export default () => {
  ipcMain.handle('get-node-info', () => {
    const data = store.get(packagesDataKey);
    const { bases = [] }: { bases: IBasePackageInfo[] } = data;
    const nodeBasicInfo = bases.find((base: IBasePackageInfo) => base.name === 'node');
    const nodeInfo = getPackageInfo(nodeBasicInfo);

    return nodeInfo;
  });

  ipcMain.handle('get-node-versions', async () => {
    return await getNodeVersions();
  });
};
