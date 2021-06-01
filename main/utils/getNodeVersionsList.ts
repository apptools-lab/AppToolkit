import allNodeVersions = require('all-node-versions');
import { TAOBAO_NODE_MIRROR } from '../constants';

async function getNodeVersionsList(): Promise<string[]> {
  const MIN_MAJOR = '14';

  const options = {
    mirror: TAOBAO_NODE_MIRROR,
    // cache for one hour
    fetch: false,
  };
  const { versions = [] } = await allNodeVersions(options);

  return versions.filter((version: string) => {
    return RegExp(`${MIN_MAJOR[0]}[${MIN_MAJOR[1]}-9](.([0-9]+)){2}`).test(version);
  });
}

export default getNodeVersionsList;
