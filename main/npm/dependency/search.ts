import fetch from 'node-fetch';
import urljoin = require('url-join');
import log from '../../utils/log';
import { getCurrentRegistry } from '../registry';
import { getGlobalDependencies } from './getInfo';

export async function searchNpmDependencies(query: string) {
  if (!query) {
    const errorMsg = 'The search content is empty. Please provide it.';
    log.error(errorMsg);
    throw new Error(errorMsg);
  }
  try {
    const currentRegistry: string = await getCurrentRegistry();
    const url = urljoin(currentRegistry, query);
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
