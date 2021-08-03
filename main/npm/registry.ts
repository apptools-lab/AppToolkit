import store, { packagesDataKey } from '../store';
import { INPMRegistry } from '../types';
import { NPM_REGISTRY } from '../constants';
import checkIsAliInternal from '../utils/checkIsAliInternal';
import { getNpmInfo, setNpmInfo } from './npmInfo';

const REGISTRY_FIELD = 'registry';

export async function getCurrentRegistry() {
  const npmrc = await getNpmInfo();
  return npmrc[REGISTRY_FIELD] || NPM_REGISTRY;
}

export async function setCurrentRegistry(registry: string) {
  const npmrc = await getNpmInfo();
  npmrc[REGISTRY_FIELD] = registry;
  await setNpmInfo(npmrc);
}

export async function getAllRegistries() {
  const isAliInternal = await checkIsAliInternal();
  const data = store.get(packagesDataKey);
  const { npmRegistries: originNpmRegistries = [] }: { npmRegistries: INPMRegistry[] } = data;
  const npmRegistries = originNpmRegistries.filter((npmRegistry) => {
    return isAliInternal ? true : !npmRegistry.isInternal;
  });

  return npmRegistries;
}
