import * as util from 'util';
import * as path from 'path';
import * as os from 'os';
import fse from 'fs-extra';
import consola from 'consola';
import type { Line, SSHConfig as GenericSSHConfig } from 'ssh-config';
import SSHConfigUtils from 'ssh-config';
import sshKeyGen from 'ssh-keygen';

const sshKeyGenAsync = util.promisify(sshKeyGen);

const sshDir = path.join(os.homedir(), '.ssh');
export const sshConfigPath = path.join(sshDir, 'config');

export interface SSHConfig {
  Host: string;
  HostName: string;
  IdentityFile: string;
  PreferredAuthentications: string;
  User: string;
}

/**
 * generate SSH public and private key
 */
export async function generateSSHKey(configId: string, userEmail: string) {
  const sshKeyPath = path.join(sshDir, configId);
  await sshKeyGenAsync({
    comment: userEmail,
    location: sshKeyPath,
    read: true,
  });
  return {
    sshKeyPath,
  };
}

export async function removeSSHKey(configId: string) {
  const sshPrivateKeyPath = path.join(sshDir, configId);
  const sshPublicKeyPath = path.join(sshDir, `${configId}.pub`);
  await fse.remove(sshPrivateKeyPath);
  await fse.remove(sshPublicKeyPath);
}

export async function getSSHPublicKey(configId: string) {
  const sshPublicKeyPath = path.join(sshDir, `${configId}.pub`);
  if (!fse.pathExistsSync(sshPublicKeyPath)) {
    throw new Error(`SSH public key ${sshPublicKeyPath} is not found.`);
  }
  return fse.readFile(sshPublicKeyPath, 'utf-8');
}

/**
 * add SSH config to ~/.ssh/config
 */
export async function addSSHConfig(
  {
    hostName,
    userName,
    configId,
  }: {
    hostName: string;
    userName: string;
    configId: string;
  },
) {
  const sshConfigSections = await getSSHConfigSections();
  const newSSHConfig = {
    Host: hostName,
    HostName: hostName,
    User: userName,
    PreferredAuthentications: 'publickey',
    IdentityFile: path.join(sshDir, `${configId}`),
  };
  sshConfigSections.append(newSSHConfig);

  await fse.writeFile(sshConfigPath, SSHConfigUtils.stringify(sshConfigSections));
}

export async function getSSHConfig(configId: string) {
  const sshConfigs = await getSSHConfigs();
  const sshConfig = sshConfigs.find(({ IdentityFile }) => path.basename(IdentityFile) === configId);
  if (!sshConfig) {
    throw new Error(`Can't find SSH config. Config id is ${configId}.`);
  }
  return sshConfig;
}

export async function getSSHConfigs() {
  const sshConfigSections = await getSSHConfigSections();
  const SSHConfigs: SSHConfig[] = [];
  // @ts-expect-error TODO: param type
  for (const { param, value, config } of sshConfigSections) {
    const restConfig = {} as unknown as SSHConfig;
    config.forEach(({ param, value }: any) => {
      // @ts-expect-error TODO: param type
      restConfig[param] = value;
    });
    SSHConfigs.push({
      [param]: value, // Host
      ...restConfig, // HostName, IdentityFile, PreferredAuthentications, User
    });
  }
  return SSHConfigs;
}

export async function updateSSHConfig(configId: string, sshConfig: Partial<SSHConfig> = {}) {
  const sshConfigSections = await getSSHConfigSections();
  const currentSSHConfigSectionIndex = findSSHConfigSectionIndex(sshConfigSections, configId);
  const currentSSHConfig = await getSSHConfig(configId);
  if (currentSSHConfig) {
    const newSSHConfigSection = {
      ...currentSSHConfig,
      ...sshConfig,
    };
    sshConfigSections.splice(currentSSHConfigSectionIndex, 1);
    sshConfigSections.append(newSSHConfigSection);
    await fse.writeFile(sshConfigPath, SSHConfigUtils.stringify(sshConfigSections));

    consola.debug('update SSH config: ', newSSHConfigSection);
  } else {
    throw new Error(`Fail to update ssh config. SSH config '${configId}' is not found.`);
  }
}

export async function removeSSHConfig(configId: string) {
  const sshConfigSections = await getSSHConfigSections();
  const currentSSHConfigIndex = findSSHConfigSectionIndex(sshConfigSections, configId);
  if (currentSSHConfigIndex > -1) {
    const removeSection = sshConfigSections.splice(currentSSHConfigIndex, 1);
    await fse.writeFile(sshConfigPath, SSHConfigUtils.stringify(sshConfigSections));

    consola.debug('remove SSH config: ', removeSection);
  } else {
    throw new Error(`Fail to remove ssh config. SSH config '${configId}' is not found.`);
  }
}

async function getSSHConfigSections(): Promise<GenericSSHConfig<Line>> {
  if (!fse.pathExistsSync(sshConfigPath)) {
    consola.debug(`The SSH config ${sshConfigPath} does not exist. Create it.`);
    await fse.createFile(sshConfigPath);
  }
  const SSHConfigContent = await fse.readFile(sshConfigPath, 'utf-8');
  const SSHConfigSections = SSHConfigUtils.parse(SSHConfigContent);
  return SSHConfigSections;
}

/**
 * find the SSH config index in ssh config array by the configName
 */
function findSSHConfigSectionIndex(SSHConfigSections: GenericSSHConfig<Line>, configId: string) {
  // @ts-expect-error type
  const currentSSHConfigIndex = SSHConfigSections.findIndex(({ config = [] }) => {
    return config.some(({ param, value }: any) => {
      return param === 'IdentityFile' && path.basename(value) === configId;
    });
  });

  return currentSSHConfigIndex;
}
