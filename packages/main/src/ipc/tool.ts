import { ipcMain } from 'electron';
import getLocalToolInfo from '../utils/getLocalToolInfo';

export function registerToolIpcEvents() {
  console.log(123123);
  ipcMain.handle('tool-getInfo', async () => {
    // TODO: get tool type
    const localToolInfo = await getLocalToolInfo('macApp', 'Visual Studio Code');
    console.log('localToolInfo: ', localToolInfo);
    return localToolInfo;
  });
}