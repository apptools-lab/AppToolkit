import * as util from 'util';
import * as path from 'path';
import * as fse from 'fs-extra';
import sshKeyGen = require('ssh-keygen');
import SSHConfig = require('ssh-config');
import log from '../utils/log';

const sshKeyGenAsync = util.promisify(sshKeyGen);
const rsaFileSuffix = '_id_rsa';

const sshConfigDir = path.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], '.ssh');
const sshConfigPath = path.join(sshConfigDir, 'config');

export async function generateSSHKey(userEmail: string, configName: string) {
  const comment = userEmail;
  const location = path.join(sshConfigDir, `${configName}${rsaFileSuffix}`);

  await sshKeyGenAsync({
    comment,
    location,
    read: true,
  });
}

export async function getSSHPublicKey(configName: string) {
  const sshPublicKeyPath = path.join(sshConfigDir, `${configName}${rsaFileSuffix}.pub`);
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

export async function addSSHConfig({ host, hostName, userName, configName }) {
  const sshConfigExists = await fse.pathExists(sshConfigPath);
  if (!sshConfigExists) {
    await fse.createFile(sshConfigPath);
  }
  const sshConfigContent = await fse.readFile(sshConfigPath, 'utf-8');
  const sshConfigs = SSHConfig.parse(sshConfigContent);
  const newSSHConfig = {
    Host: host,
    HostName: hostName,
    User: userName,
    PreferredAuthentications: 'publickey',
    IdentityFile: path.join(sshConfigDir, `${configName}${rsaFileSuffix}`),
  };
  sshConfigs.append(newSSHConfig);

  log.info('add ssh configs: ', newSSHConfig);

  await fse.writeFile(sshConfigPath, SSHConfig.stringify(sshConfigs));
}

export async function updateSSHConfig(hostName: string, userName: string) {
  console.log(hostName, userName);
}
