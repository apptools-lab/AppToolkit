import * as path from 'path';

function getSourcePath(dir: string, ...args: string[]) {
  const resourcesPath = process.env.NODE_ENV === 'development' ? dir : (process.resourcesPath || process.env.resourcesPath);
  const sourcePath = path.join(resourcesPath, ...args);
  return sourcePath;
}

export default getSourcePath;
