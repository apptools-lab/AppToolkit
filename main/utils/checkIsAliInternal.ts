import { checkAliInternal } from 'ice-npm-utils';
const NodeCache = require('node-cache');

const nodeCache = new NodeCache();
const cacheId = 'isAliInternal';
const cacheTimeoutSeconds = 60 * 60;

export default async function () {
  let isAliInternal = nodeCache.get(cacheId);
  if (!isAliInternal) {
    isAliInternal = await checkAliInternal();
    nodeCache.set(cacheId, isAliInternal, cacheTimeoutSeconds);
  }
  return isAliInternal;
}
