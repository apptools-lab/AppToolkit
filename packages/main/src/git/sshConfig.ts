import * as util from 'util';
import * as path from 'path';
import * as os from 'os';
import fse from 'fs-extra';
import consola from 'consola';
import SSHConfigUtils, { Line, SSHConfig } from 'ssh-config';
import sshKeyGen from 'ssh-keygen';

const sshKeyGenAsync = util.promisify(sshKeyGen);

const sshDir = path.join(os.homedir(), '.ssh');
export const sshConfigPath = path.join(sshDir, 'config');

export interface ISSHConfig {
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
  if (!fse.pathExistsSync(sshConfigPath)) {
    consola.info(`The SSH config ${sshConfigPath} does not exist. Create it.`);
    await fse.createFile(sshConfigPath);
  }
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
  const SSHConfigs: ISSHConfig[] = [];
  // @ts-ignore TODO: param type
  for (const { param, value, config } of sshConfigSections) {
    const restConfig = {} as unknown as ISSHConfig;
    config.forEach(({ param, value }: any) => {
      // @ts-ignore TODO: param type
      restConfig[param] = value;
    });
    SSHConfigs.push({
      [param]: value, // Host
      ...restConfig, // HostName, IdentityFile, PreferredAuthentications, User
    });
  }
  return SSHConfigs;
}

async function getSSHConfigSections(): Promise<SSHConfig<Line>> {
  const SSHConfigContent = await fse.readFile(sshConfigPath, 'utf-8');
  const SSHConfigSections = SSHConfigUtils.parse(SSHConfigContent);
  return SSHConfigSections;
}
