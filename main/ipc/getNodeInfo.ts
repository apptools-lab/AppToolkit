import * as path from 'path';
import * as fse from 'fs-extra';
import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import getNodeVersions from '../utils/getNodeVersions';
import { getPackageInfo } from '../packageInfo';
import { IBasePackageInfo } from '../types';

export default () => {
  ipcMain.handle('get-node-info', async () => {
    // TODO: get data.json from OSS and save it in the storage when app starts first
    const data = await fse.readJSON(path.join(__dirname, '../data', 'data.json'));
    const { bases = [] }: { bases: IBasePackageInfo[] } = data;
    const nodeBasicInfo = bases.find((base: IBasePackageInfo) => base.name === 'node');
    const nodeInfo = getPackageInfo(nodeBasicInfo);

    return nodeInfo;
  });

  ipcMain.handle('get-node-versions', async (event: IpcMainInvokeEvent) => {
    return await getNodeVersions();
  });
};
