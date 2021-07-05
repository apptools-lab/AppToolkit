import { execSync } from 'child_process';
import * as fse from 'fs-extra';
import log from './log';

/**
 * Install command to the path
 * @param target the path of the command
 * @param command the command executed in the shell
 */
async function installCommandToPath(target: string, command: string) {
  const source = `/usr/local/bin/${command}`;

  const installRet = await isInstalled(source, target);
  if (installRet) {
    log.info(`${source} has already linked to ${target}.`);
    return;
  }

  // Different source, delete it first
  try {
    await fse.unlink(source);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error; // throw on any error but file not found
    }
  }

  // link target
  try {
    await fse.symlink(target, source);
  } catch (error) {
    if (error.code !== 'EACCES' && error.code !== 'ENOENT') {
      throw error;
    }

    try {
      // eslint-disable-next-line
      const linkSourceCommand = `osascript -e "do shell script \\"mkdir -p /usr/local/bin && ln -sf \'${target}\' \'${source}\'\\" with administrator privileges"`;
      execSync(linkSourceCommand);
    } catch (err) {
      log.error(`Error: Unable to link ${target} to ${source}.`);
      throw err;
    }
  }

  log.info(`Link ${target} to ${source} successfully.`);
}

async function isInstalled(source: string, target: string) {
  try {
    const stat = await fse.lstat(source);
    return stat.isSymbolicLink() && target === fse.realpathSync(source);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }

    throw err;
  }
}

export default installCommandToPath;
