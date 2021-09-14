import store, { packagesDataKey } from '../../store';
import checkIsAliInternal from '../../utils/checkIsAliInternal';
import { NPMRegistry } from '../../types';

export default async function getAllRegistries() {
  const isAliInternal = await checkIsAliInternal();
  const data = store.get(packagesDataKey);
  const { npmRegistries: originNpmRegistries = [] }: { npmRegistries: NPMRegistry[] } = data;
  const npmRegistries = originNpmRegistries.filter((npmRegistry) => {
    return isAliInternal ? true : !npmRegistry.isInternal;
  });

  return npmRegistries;
}
