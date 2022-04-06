import { dialog } from 'electron';

export default async function getSelectedFolderPath() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (canceled) {
    return;
  } else {
    return filePaths[0];
  }
}