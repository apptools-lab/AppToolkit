import { test, describe, expect } from 'vitest';
import { 
  getGlobalGitConfig, 
  setGlobalGitConfig,
  addUserGitConfig,
  getUserGitConfig,
  setUserGitConfig,
  removeUserGitConfig,
  generateSSHKey,
  getSSHConfigs,
  getSSHConfig,
  addSSHConfig,
  sshConfigPath,
} from '../src/git';
import * as path from 'path';
import fse from 'fs-extra';

const mockUserConfigId = 'test-config-id';
const mockEmail = 'test@example.com';
const mockUsername = 'test';
const mockGlobalConfig = { 
  'user.name': mockUsername,
  'user.email': mockEmail,
};
const mockSSHConfig = {
  hostName: 'test.com',
  userName: mockUsername,
  configId: mockUserConfigId,
};

describe('config', () => {
  test('get global config', async () => {
    const globalConfig = await getGlobalGitConfig();
    expect(globalConfig).toBeDefined();
  });

  test('set global config', async () => {
    const originGlobalConfig = await getGlobalGitConfig();
    await setGlobalGitConfig(mockGlobalConfig);
    const newGlobalConfig = await getGlobalGitConfig();
    expect(newGlobalConfig['user.name']).toBe(mockGlobalConfig['user.name']);
    expect(newGlobalConfig['user.email']).toBe(mockGlobalConfig['user.email']);
    // reset the global config
    await setGlobalGitConfig(originGlobalConfig);
  });

  test('add user config', async () => {
    const userConfigPath = await addUserGitConfig(mockUserConfigId);
    expect(userConfigPath).not.toBeUndefined();
  
    await fse.remove(path.join(path.dirname(userConfigPath), '..'));
  });

  test('remove user config', async () => {
    const userConfigPath = await addUserGitConfig(mockUserConfigId);
    await removeUserGitConfig(mockUserConfigId);
   
    expect(await fse.pathExists(userConfigPath)).toBe(false);
  });

  test('get user config', async () => {
    const userConfigPath = await addUserGitConfig(mockUserConfigId);
    const userConfig = await getUserGitConfig(mockUserConfigId);
    expect(Object.keys(userConfig).length > 0).toBeTruthy();
    // remove git user config
    await fse.remove(path.join(path.dirname(userConfigPath), '..'));
  });

  test('set user config', async () => {
    const userConfigPath = await addUserGitConfig(mockUserConfigId);
    await setUserGitConfig(mockUserConfigId, mockGlobalConfig);
    const newGlobalConfig = await getUserGitConfig(mockUserConfigId);

    expect(newGlobalConfig['user.name']).toBe(mockGlobalConfig['user.name']);
    expect(newGlobalConfig['user.email']).toBe(mockGlobalConfig['user.email']);
    // remove git user config
    await fse.remove(path.join(path.dirname(userConfigPath), '..'));
  });
})

describe('ssh', () => {
  test('generate SSH key', async () => {
    const { sshKeyPath } = await generateSSHKey(mockUserConfigId, mockEmail);
    const sshPublicKeyPath = `${sshKeyPath}.pub`;
    expect(fse.pathExistsSync(sshPublicKeyPath)).toBeTruthy();
    expect(fse.pathExistsSync(sshKeyPath)).toBeTruthy();
    // remove test ssh key
    await fse.remove(sshKeyPath);
    await fse.remove(sshPublicKeyPath);
  });

  test('add ssh config', async () => {
    let originalSSHConfig = '';
    const sshConfigExists = await fse.pathExists(sshConfigPath);
    if (sshConfigExists) {
      originalSSHConfig = await fse.readFile(sshConfigPath, 'utf-8');
    }
    await addSSHConfig(mockSSHConfig);
    const sshConfigContent = await fse.readFile(sshConfigPath, 'utf-8');
    expect(sshConfigContent.includes(mockSSHConfig.hostName)).toBeTruthy();
    expect(sshConfigContent.includes(mockSSHConfig.userName)).toBeTruthy();
    expect(sshConfigContent.includes(mockSSHConfig.configId)).toBeTruthy();

    if (sshConfigExists) {
      await fse.writeFile(sshConfigPath, originalSSHConfig, 'utf-8');
    }
  });

  test('get all ssh config', async () => {
    let originalSSHConfig = '';
    const sshConfigExists = await fse.pathExists(sshConfigPath);
    if (sshConfigExists) {
      originalSSHConfig = await fse.readFile(sshConfigPath, 'utf-8');
    }
    await addSSHConfig(mockSSHConfig);
    const allSSHConfigs = await getSSHConfigs();
    expect(allSSHConfigs.find(sshConfig => sshConfig.HostName === mockSSHConfig.hostName)).toBeDefined();

    if (sshConfigExists) {
      await fse.writeFile(sshConfigPath, originalSSHConfig, 'utf-8');
    }
  });

  test('get one ssh config', async () => {
    let originalSSHConfig = '';
    const sshConfigExists = await fse.pathExists(sshConfigPath);
    if (sshConfigExists) {
      originalSSHConfig = await fse.readFile(sshConfigPath, 'utf-8');
    }
    await addSSHConfig(mockSSHConfig);
    const sshConfig = await getSSHConfig(mockSSHConfig.configId);
    expect(sshConfig).toBeDefined();

    if (sshConfigExists) {
      await fse.writeFile(sshConfigPath, originalSSHConfig, 'utf-8');
    }
  })
});
