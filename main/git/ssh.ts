import * as util from 'util';
import * as path from 'path';
import * as fse from 'fs-extra';
import sshKeyGen = require('ssh-keygen');
import SSHConfig = require('ssh-config');
import log from '../utils/log';

const sshKeyGenAsync = util.promisify(sshKeyGen);


const HOME_DIR = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
export const sshConfigDir = path.join(HOME_DIR, '.ssh');
export const rsaFileSuffix = '_id_rsa';

const sshConfigPath = path.join(sshConfigDir, 'config');

/**
 * generate ssh public key and private key
 * @param userEmail current user email of this git config
 * @param configName ssh config name
 */
export async function generateSSHKey(userEmail: string, configName: string) {
  const location = path.join(sshConfigDir, `${configName}${rsaFileSuffix}`);

  await sshKeyGenAsync({
    comment: userEmail,
    location,
    read: true,
  });
}

export async function getSSHPublicKey(sshPrivateKeyPath: string) {
  const sshPublicKeyPath = `${sshPrivateKeyPath}.pub`;
  const sshPublicKeyFileExists = await fse.pathExists(sshPublicKeyPath);
  if (!sshPublicKeyFileExists) {
    return '';
  }
  return await fse.readFile(sshPublicKeyPath, 'utf-8');
}

export async function getSSHConfigs() {
  const sshConfigExists = await fse.pathExists(sshConfigPath);
  let sshConfigs;
  if (!sshConfigExists) {
    sshConfigs = [];
  } else {
    const sshConfigContent = await fse.readFile(sshConfigPath, 'utf-8');
    sshConfigs = SSHConfig.parse(sshConfigContent);
  }

  log.info('ssh configs: ', sshConfigs);
  return sshConfigs;
}

/**
 * add ssh config to ~/.ssh/config
 */
export async function addSSHConfig(
  { hostName, userName, configName }: { configName: string; hostName: string; userName: string },
) {
  const sshConfigExists = await fse.pathExists(sshConfigPath);
  if (!sshConfigExists) {
    await fse.createFile(sshConfigPath);
  }
  const sshConfigContent = await fse.readFile(sshConfigPath, 'utf-8');
  const sshConfigs = SSHConfig.parse(sshConfigContent);
  const newSSHConfig = {
    Host: hostName,
    HostName: hostName,
    User: userName,
    PreferredAuthentications: 'publickey',
    IdentityFile: path.join(sshConfigDir, `${configName}${rsaFileSuffix}`),
  };
  sshConfigs.append(newSSHConfig);

  await fse.writeFile(sshConfigPath, SSHConfig.stringify(sshConfigs));

  log.info('add ssh configs: ', newSSHConfig);
}

export async function updateSSHConfig(gitConfig: any, configName: string) {
  const sshConfigExists = await fse.pathExists(sshConfigPath);
  if (!sshConfigExists) {
    return;
  }
  const sshConfigContent = await fse.readFile(sshConfigPath, 'utf-8');
  const sshConfigs = SSHConfig.parse(sshConfigContent);

  const privateKeyPath = path.join(sshConfigDir, `${configName}${rsaFileSuffix}`);
  let currentSSHConfig;

  // eslint-disable-next-line no-labels
  loopLabel:
  for (const sshConfig of sshConfigs) {
    const { config = [] } = sshConfig;
    for (const { param, value } of config) {
      if (param === 'IdentityFile' && value.replace('~', HOME_DIR) === privateKeyPath) {
        currentSSHConfig = sshConfig;
        // eslint-disable-next-line no-labels
        break loopLabel;
      }
    }
  }

  if (currentSSHConfig) {
    sshConfigs.remove({ Host: currentSSHConfig.value });
    const newSSHConfig = {
      Host: gitConfig.hostName || '',
      HostName: gitConfig.hostName || '',
      User: gitConfig?.user?.name || '',
      PreferredAuthentications: 'publickey',
      IdentityFile: path.join(sshConfigDir, `${configName}${rsaFileSuffix}`),
    };

    sshConfigs.append(newSSHConfig);

    await fse.writeFile(sshConfigPath, SSHConfig.stringify(sshConfigs));

    log.info('Update SSH config: ', newSSHConfig);
  }
}

export async function removeSSHConfig(gitConfig, configName) {
  const sshConfigExists = await fse.pathExists(sshConfigPath);
  if (!sshConfigExists) {
    return;
  }
  const sshConfigContent = await fse.readFile(sshConfigPath, 'utf-8');
  const { hostName } = gitConfig;
  const sshConfigs = SSHConfig.parse(sshConfigContent);
  const targetSSHConfig = sshConfigs.find({ Host: hostName });
  if (!targetSSHConfig) {
    return;
  }
  sshConfigs.remove({ Host: hostName });

  await fse.writeFile(sshConfigPath, SSHConfig.stringify(sshConfigs));

  // remove ssh private key and public key
  await fse.remove(path.join(sshConfigDir, `${configName}${rsaFileSuffix}`));
  await fse.remove(path.join(sshConfigDir, `${configName}${rsaFileSuffix}.pub`));

  log.info(`Remove ${hostName} SSH config`);
}
