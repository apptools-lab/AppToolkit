import * as util from 'util';
import * as path from 'path';
import * as fse from 'fs-extra';
import SSHKeyGen = require('ssh-keygen');
import SSHConfig = require('ssh-config');
import log from '../utils/log';

const SSHKeyGenAsync = util.promisify(SSHKeyGen);

const HOME_DIR = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
export const SSHDir = path.join(HOME_DIR, '.ssh');
export const rsaFileSuffix = '_id_rsa';
// ~/.ssh/config
const SSHConfigPath = path.join(SSHDir, 'config');

/**
 * generate SSH public key and private key
 * @param userEmail current user email of this git config
 * @param configName SSH config name
 */
export async function generateSSHKey(userEmail: string, configName: string) {
  const location = path.join(SSHDir, `${configName}${rsaFileSuffix}`);

  await SSHKeyGenAsync({
    comment: userEmail,
    location,
    read: true,
  });
}

export async function getSSHPublicKey(SSHPrivateKeyPath: string) {
  const SSHPublicKeyPath = `${SSHPrivateKeyPath}.pub`;
  const SSHPublicKeyFileExists = await fse.pathExists(SSHPublicKeyPath);
  if (!SSHPublicKeyFileExists) {
    return '';
  }
  return await fse.readFile(SSHPublicKeyPath, 'utf-8');
}

export async function getSSHConfigs() {
  const SSHConfigExists = await fse.pathExists(SSHConfigPath);
  let SSHConfigSections;
  if (!SSHConfigExists) {
    SSHConfigSections = [];
  } else {
    const SSHConfigContent = await fse.readFile(SSHConfigPath, 'utf-8');
    SSHConfigSections = SSHConfig.parse(SSHConfigContent);
  }

  log.info('get-SSH-configs', SSHConfigSections);
  return SSHConfigSections;
}

/**
 * add SSH config to ~/.ssh/config
 */
export async function addSSHConfig(
  { hostName, userName, configName }: { configName: string; hostName: string; userName: string },
) {
  const SSHConfigExists = await fse.pathExists(SSHConfigPath);
  if (!SSHConfigExists) {
    log.info('add-ssh-config', 'create ssh config file:', SSHConfigPath);
    await fse.createFile(SSHConfigPath);
  }
  const SSHConfigContent = await fse.readFile(SSHConfigPath, 'utf-8');
  const SSHConfigSections = SSHConfig.parse(SSHConfigContent);
  const newSSHConfigSection = {
    Host: hostName,
    HostName: hostName,
    User: userName,
    PreferredAuthentications: 'publickey',
    IdentityFile: path.join(SSHDir, `${configName}${rsaFileSuffix}`),
  };
  SSHConfigSections.append(newSSHConfigSection);

  await fse.writeFile(SSHConfigPath, SSHConfig.stringify(SSHConfigSections));

  log.info('add-SSH-config', newSSHConfigSection);
}

export async function updateSSHConfig(configName: string, hostName = '', userName = '') {
  const SSHConfigExists = await fse.pathExists(SSHConfigPath);
  if (!SSHConfigExists) {
    const error = new Error(`The SSH config path: ${SSHConfigPath} does not exist.`);
    error.name = 'update-ssh-config';
    log.error(error);
    return;
  }
  const SSHConfigContent = await fse.readFile(SSHConfigPath, 'utf-8');
  const SSHConfigSections = SSHConfig.parse(SSHConfigContent);

  const SSHConfigSectionIndex = findSSHConfigSectionIndex(SSHConfigSections, configName);

  if (SSHConfigSectionIndex > -1) {
    SSHConfigSections.splice(SSHConfigSectionIndex, 1);
    const newSSHConfigSection = {
      Host: hostName,
      HostName: hostName,
      User: userName,
      PreferredAuthentications: 'publickey',
      IdentityFile: path.join(SSHDir, `${configName}${rsaFileSuffix}`),
    };

    SSHConfigSections.append(newSSHConfigSection);

    await fse.writeFile(SSHConfigPath, SSHConfig.stringify(SSHConfigSections));

    log.info('update-SSH-config', newSSHConfigSection);
  }
}

export async function removeSSHConfig(configName: string) {
  const SSHConfigExists = await fse.pathExists(SSHConfigPath);
  if (!SSHConfigExists) {
    const error = new Error(`The SSH config path: ${SSHConfigPath} does not exist.`);
    error.name = 'remove-ssh-config';
    log.error(error);
    throw error;
  }
  const SSHConfigContent = await fse.readFile(SSHConfigPath, 'utf-8');
  const SSHConfigSections = SSHConfig.parse(SSHConfigContent);

  const currentSSHConfigIndex = findSSHConfigSectionIndex(SSHConfigSections, configName);
  if (currentSSHConfigIndex <= -1) {
    return;
  }
  // remove SSH config
  log.info('remove-SSH-config', SSHConfigSections[currentSSHConfigIndex]);
  SSHConfigSections.splice(currentSSHConfigIndex, 1);
  await fse.writeFile(SSHConfigPath, SSHConfig.stringify(SSHConfigSections));

  // remove SSH private key and public key
  const privateSSHKeyPath = path.join(SSHDir, `${configName}${rsaFileSuffix}`);
  const publicSSHKeyPath = path.join(SSHDir, `${configName}${rsaFileSuffix}.pub`);
  await fse.remove(privateSSHKeyPath);
  await fse.remove(publicSSHKeyPath);
}

/**
 * find the SSH config index in ssh config array by the configName(id)
 */
function findSSHConfigSectionIndex(SSHConfigSections: any[], configName: string) {
  const privateKeyPath = path.join(SSHDir, `${configName}${rsaFileSuffix}`);

  let currentSSHConfigIndex = -1;
  // eslint-disable-next-line no-labels
  loopLabel:
  for (let index = 0; index < SSHConfigSections.length; index++) {
    const section = SSHConfigSections[index];
    const { config = [] } = section;
    for (const { param, value } of config) {
      if (param === 'IdentityFile' && value.replace('~', HOME_DIR) === privateKeyPath) {
        currentSSHConfigIndex = index;
        // eslint-disable-next-line no-labels
        break loopLabel;
      }
    }
  }

  return currentSSHConfigIndex;
}
