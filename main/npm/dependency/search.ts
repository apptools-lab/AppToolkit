import fetch from 'node-fetch';
import urljoin = require('url-join');
import log from '../../utils/log';
import getNpmRegistry from '../../utils/getNpmRegistry';
import { getGlobalDependencies } from './getInfo';

export async function searchNpmDependencies(query: string) {
  if (!query) {
    const errorMsg = '请输入 npm 依赖名称';
    log.error(errorMsg);
    throw new Error(errorMsg);
  }
  try {
    const npmRegistry: string = await getNpmRegistry();
    const url = urljoin(npmRegistry, query);
    const res = await fetch(url);
    const content = await res.json();

    const { name, homepage, error } = content;
    if (error) {
      log.error(error);
      return [];
    }
    const version = content['dist-tags'].latest;

    let globalDependencies;
    try {
      globalDependencies = await getGlobalDependencies(false);
    } catch {
      globalDependencies = [];
    }
    const globalDependencyKeys = globalDependencies.map((globalDependency) => globalDependency.name);

    const result = [{
      name,
      homepage,
      version,
      isInstalled: globalDependencyKeys.includes(name),
    }];
    log.info('searchNpmDependencies', result);

    return result;
  } catch (e) {
    log.error(e.message);
    throw e;
  }
}
