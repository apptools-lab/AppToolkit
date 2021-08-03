import { ipcMain } from 'electron';
import checkIsAliInternal from '../utils/checkIsAliInternal';

export default () => {
  ipcMain.handle('check-is-ali-internal', async () => {
    return await checkIsAliInternal();
  });
};
