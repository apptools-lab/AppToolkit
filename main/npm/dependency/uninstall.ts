import * as execa from 'execa';
import log from '../../utils/log';
import { record } from '../../recorder';

export async function uninstallGlobalDependency(dependency: string) {
  if (!dependency) {
    const errMsg = 'No Dependency was passed.';
    log.error(errMsg);
    throw new Error(errMsg);
  }

  try {
    const command = `npm uninstall ${dependency} -g`;
    log.info('Command: ', command);
    await execa.command(command);
    log.info(`Uninstall ${dependency} successfully.`);
    record({
      module: 'node',
      action: 'uninstallGlobalDependency',
      data: {
        dependency,
      },
    });
  } catch (err) {
    log.error(err.message);
    throw new Error(err.message);
  }
}
