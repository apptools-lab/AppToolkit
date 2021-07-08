import * as npm from 'npm';
import * as ini from 'ini';
import * as fse from 'fs-extra';
import store, { packagesDataKey } from '../store';
import { INPMRegistry } from '../types';
import { NPMRC_PATH } from '../constants';
import checkIsAliInternal from '../utils/checkIsAliInternal';

const REGISTRY_FIELD = 'registry';

export function getCurrentRegistry() {
  return npm.load((err) => {
    if (err) {
      throw err;
    }
    return npm.config.get(REGISTRY_FIELD);
  });
}

export async function setCurrentRegistry(registry: string) {
  const npmrcExists = await fse.pathExists(NPMRC_PATH);
  const npmrc = npmrcExists ? ini.parse(fse.readFileSync(NPMRC_PATH, 'utf-8')) : {};
  npmrc[REGISTRY_FIELD] = registry;
  await fse.writeFile(NPMRC_PATH, ini.stringify(npmrc));
}

export async function getAllRegistries() {
  const isAliInternal = await checkIsAliInternal();
  const data = store.get(packagesDataKey);
  const { npmRegistries = [] }: { npmRegistries: INPMRegistry[] } = data;
  return npmRegistries.filter((npmRegistry) => {
    return isAliInternal ? true : !npmRegistry.isInternal;
  });
}
