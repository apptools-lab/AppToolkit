import { ALI_NPM_REGISTRY } from '@appworks/constant';
import { getCurrentRegistry } from '../npm/registry';
import checkIsAliInternal from './checkIsAliInternal';

async function getNpmRegistry() {
  const isAliInternal = await checkIsAliInternal();
  return isAliInternal ? ALI_NPM_REGISTRY : await getCurrentRegistry();
}

export default getNpmRegistry;
