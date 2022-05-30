import { ipcMain } from 'electron';
import getLocalToolInfo from '../utils/getLocalToolInfo';

export function registerToolIpcEvents() {
  ipcMain.handle('tool-getInfo', async () => {
    // TODO: get tool type
    const localToolInfo = await getLocalToolInfo('macApp', 'Visual Studio Code');
    return localToolInfo;
  });
}