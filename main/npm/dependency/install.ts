import * as execa from 'execa';
import log from '../../utils/log';

export async function installGlobalDependency(dependency: string, version: string) {
  if (!dependency) {
    const errMsg = 'No Dependency was passed.';
    log.error(errMsg);
    throw new Error(errMsg);
  }

  try {
    const command = `npm install ${dependency}@${version || 'latest'} -g`;
    log.info('Command: ', command);
    await execa.command(command);
    log.info(`Install ${dependency} successfully.`);
  } catch (err) {
    log.error(err.message);
    throw new Error(err.message);
  }
}
