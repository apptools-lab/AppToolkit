import { TAOBAO_NPM_REGISTRY, ALI_NPM_REGISTRY } from '../constants';
import checkIsAliInternal from './checkIsAliInternal';

async function getNpmRegistry() {
  const isAliInternal = await checkIsAliInternal();
  return isAliInternal ? ALI_NPM_REGISTRY : TAOBAO_NPM_REGISTRY;
}

export default getNpmRegistry;
