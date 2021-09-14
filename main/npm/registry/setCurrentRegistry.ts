import { REGISTRY_FIELD } from '../../constants';
import { getNpmInfo, setNpmInfo } from '../npmInfo';
import { record } from '../../recorder';

export default async function setCurrentRegistry(registry: string) {
  const npmrc = await getNpmInfo();
  npmrc[REGISTRY_FIELD] = registry;
  await setNpmInfo(npmrc);
  record({
    module: 'node',
    action: 'setNpmRegistry',
  });
}
