import { NPM_REGISTRY, REGISTRY_FIELD } from '../../constants';
import { getNpmInfo } from '../npmInfo';

export default async function getCurrentRegistry() {
  const npmrc = await getNpmInfo();
  return npmrc[REGISTRY_FIELD] || NPM_REGISTRY;
}
