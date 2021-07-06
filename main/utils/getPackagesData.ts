import * as path from 'path';
import * as fse from 'fs-extra';

async function getPackagesData() {
  return await fse.readJSON(path.join(__dirname, '..', 'data', 'data.json'));
}

export default getPackagesData;
