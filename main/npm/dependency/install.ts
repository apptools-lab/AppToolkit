import * as execa from 'execa';
import log from '../../utils/log';
import getNpmRegistry from '../../utils/getNpmRegistry';
import { record } from '../../recorder';

export async function installGlobalDependency(dependency: string, version: string) {
  if (!dependency) {
    const errMsg = 'No Dependency was passed.';
    log.error(errMsg);
    throw new Error(errMsg);
  }

  const npmRegistry = await getNpmRegistry();
  try {
    const command = `npm install ${dependency}@${version || 'latest'} -g --registry=${npmRegistry}`;
    log.info('Command: ', command);
    await execa.command(command);
    log.info(`Install ${dependency} successfully.`);
    record({
      module: 'node',
      action: 'installGlobalDependency',
      data: {
        dependency,
        version,
      },
    });
  } catch (err) {
    log.error(err.message);
    throw new Error(err.message);
  }
}
