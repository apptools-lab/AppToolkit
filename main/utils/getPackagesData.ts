import * as path from 'path';
import * as fse from 'fs-extra';
import getSourcePath from './getSourcePath';

async function getPackagesData() {
  return await fse.readJSON(getSourcePath(path.join(__dirname, '..'), 'data', 'data.json'));
}

export default getPackagesData;
