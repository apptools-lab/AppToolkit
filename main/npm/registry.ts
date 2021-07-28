import * as ini from 'ini';
import * as fse from 'fs-extra';
import { ALI_NPM_REGISTRY } from '@appworks/constant';
import store, { packagesDataKey } from '../store';
import { INPMRegistry } from '../types';
import { NPMRC_PATH, NPM_REGISTRY, TAOBAO_NPM_REGISTRY } from '../constants';
import checkIsAliInternal from '../utils/checkIsAliInternal';
import log from '../utils/log';

const REGISTRY_FIELD = 'registry';

export async function getCurrentRegistry() {
  const npmrc = await getNpmInfo();
  return npmrc[REGISTRY_FIELD] || NPM_REGISTRY;
}

export async function setCurrentRegistry(registry: string) {
  const npmrc = await getNpmInfo();
  npmrc[REGISTRY_FIELD] = registry;
  await fse.writeFile(NPMRC_PATH, ini.stringify(npmrc));

  log.info('Write to', NPMRC_PATH, npmrc);
}

export async function getAllRegistries() {
  const isAliInternal = await checkIsAliInternal();
  const data = store.get(packagesDataKey);
  const { npmRegistries: originNpmRegistries = [] }: { npmRegistries: INPMRegistry[] } = data;
  const npmRegistries = originNpmRegistries.filter((npmRegistry) => {
    return isAliInternal ? true : !npmRegistry.isInternal;
  });

  npmRegistries.forEach((item: INPMRegistry) => {
    item.recommended = isAliInternal ? item.registry === ALI_NPM_REGISTRY : item.registry === TAOBAO_NPM_REGISTRY;
  });

  return npmRegistries;
}

async function getNpmInfo() {
  const npmrcExists = await fse.pathExists(NPMRC_PATH);
  const npmrc = npmrcExists ? ini.parse(fse.readFileSync(NPMRC_PATH, 'utf-8')) : {};
  return npmrc;
}
