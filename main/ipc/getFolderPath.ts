import * as path from 'path';
import { dialog, ipcMain } from 'electron';

export default () => {
  ipcMain.handle('get-folder-path', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (canceled) {
      return '';
    }
    const selectedFolderPath = filePaths[0];
    return path.join(selectedFolderPath, '/');
  });
};
