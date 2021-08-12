import * as path from 'path';

function getSourcePath(dir: string, ...args: string[]) {
  const sourcePath = path.join(process.env.NODE_ENV === 'development' ? dir : process.resourcesPath, ...args);
  return sourcePath;
}

export default getSourcePath;
