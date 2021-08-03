import * as execa from 'execa';
import log from '../../utils/log';
import getNpmRegistry from '../../utils/getNpmRegistry';

export async function updateGlobalDependency(dependency: string) {
  if (!dependency) {
    const errMsg = 'No Dependency was passed.';
    log.error(errMsg);
    throw new Error(errMsg);
  }
  try {
    const npmRegistry = await getNpmRegistry();
    const command = `npm update -g ${dependency} --registry=${npmRegistry}`;
    log.info('Command: ', command);
    await execa.command(command);
    log.info(`Update ${dependency} successfully.`);
  } catch (err) {
    log.error(err.message);
    throw new Error(err.message);
  }
}
