import * as fse from 'fs-extra';
import log from './log';

/**
 * Install command to the path
 * @param source
 */
function installCommandToPath(source: string, command: string) {
  const target = `/usr/local/bin/${command}`;

  return isInstalled(target, source)
    .then((ret) => {
      if (ret) {
        return Promise.resolve(null);
      } else {
        return fse.unlink(target)
          .then(undefined, ignore('ENOENT', null))
          .then(() => fse.symlink(source, target))
          .then(() => log.info(`Link ${source} to ${target} successfully.`));
      }
    });
}

async function isInstalled(target: string, source: string) {
  try {
    const stat = await fse.lstat(target);
    return stat.isSymbolicLink() && source === fse.realpathSync(target);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }

    throw err;
  }
}

function ignore<T>(code: string, value: T): (err: any) => Promise<T> {
  return (err) => (err.code === code ? Promise.resolve<T>(value) : Promise.reject<T>(err));
}

export default installCommandToPath;
