import { ipcMain } from 'electron';
import { getRecommendedToolsInfo } from '@/utils/getToolInfo';

export function registerToolIpcEvents() {
  ipcMain.handle('tool.getRecommendedToolsInfo', () => {
    return getRecommendedToolsInfo();
  });
}
