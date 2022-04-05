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
  updateSSHConfig,
  removeSSHConfig,
  getUserGitDirs,
  setUserGitDir,
} from '../src/git';
import * as path from 'path';
import * as os from 'os';
import fse from 'fs-extra';

const mockUserConfigId = 'test-config-id';
const mockEmail = 'test@example.com';
const mockUsername = 'test';
const mockGlobalConfig = { 
  'user.name': mockUsername,
  'user.email': mockEmail,
};

describe('config', () => {
  test('get global config', async () => {
    // FIXME: in github ci test env, the path `~/.gitconfig` does not exist
    if (!fse.pathExistsSync(path.join(os.homedir(), '.gitconfig'))) {
      return;
    }
    const globalConfig = await getGlobalGitConfig();
    expect(globalConfig).toBeDefined();
  });

  test('set global config', async () => {
    // FIXME: in github ci test env, the path `~/.gitconfig` does not exist
    if (!fse.pathExistsSync(path.join(os.homedir(), '.gitconfig'))) {
      return;
    }
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
  
  test('set user git dir', async () => {
    const dirPath = '/path/to/test';
    await setUserGitDir(mockUserConfigId, dirPath);

    const globalGitConfig = await getGlobalGitConfig();
    const keys = Object.keys(globalGitConfig);
    const key = keys.find(key => key.includes(dirPath));
    expect(key).not.toBeUndefined();
    const value = globalGitConfig[key];
    expect(value.includes(mockUserConfigId)).toBeTruthy();
    // reset global config
    delete globalGitConfig[key];
    setGlobalGitConfig(globalGitConfig);
  });

  test('get user git dirs', async () => {
    const dirPath = '/path/to/test';
    await setUserGitDir(mockUserConfigId, dirPath);
    const userGitDirs = await getUserGitDirs(mockUserConfigId);
    expect(userGitDirs.length).not.toBe(0);
    // reset global config
    const globalGitConfig = await getGlobalGitConfig();
    const keys = Object.keys(globalGitConfig);
    const key = keys.find(key => key.includes(dirPath));
    delete globalGitConfig[key];
    setGlobalGitConfig(globalGitConfig);
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
    const mockSSHConfig = {
      hostName: 'add-ssh-config.com',
      userName: 'add-ssh-config',
      configId: 'add-ssh-config',
    };
    await addSSHConfig(mockSSHConfig);
    const sshConfigContent = await fse.readFile(sshConfigPath, 'utf-8');
    expect(sshConfigContent.includes(mockSSHConfig.hostName)).toBeTruthy();
    expect(sshConfigContent.includes(mockSSHConfig.userName)).toBeTruthy();
    expect(sshConfigContent.includes(mockSSHConfig.configId)).toBeTruthy();

    if (sshConfigExists) {
      // reset ssh config
      await fse.writeFile(sshConfigPath, originalSSHConfig, 'utf-8');
    }
  });

  test('get all ssh config', async () => {
    let originalSSHConfig = '';
    const sshConfigExists = await fse.pathExists(sshConfigPath);
    if (sshConfigExists) {
      originalSSHConfig = await fse.readFile(sshConfigPath, 'utf-8');
    }
    const mockSSHConfig = {
      hostName: 'get-all-ssh-config.com',
      userName: 'get-all-ssh-config',
      configId: 'get-all-ssh-config',
    };
    await addSSHConfig(mockSSHConfig);
    const allSSHConfigs = await getSSHConfigs();
    expect(allSSHConfigs.find(sshConfig => sshConfig.HostName === mockSSHConfig.hostName)).toBeDefined();

    if (sshConfigExists) {
      // reset ssh config
      await fse.writeFile(sshConfigPath, originalSSHConfig, 'utf-8');
    }
  });

  test('get one ssh config', async () => {
    let originalSSHConfig = '';
    const sshConfigExists = await fse.pathExists(sshConfigPath);
    if (sshConfigExists) {
      originalSSHConfig = await fse.readFile(sshConfigPath, 'utf-8');
    }
    const mockSSHConfig = {
      hostName: 'get-one-ssh-config.com',
      userName: 'get-one-ssh-config',
      configId: 'get-one-ssh-config',
    };
    await addSSHConfig(mockSSHConfig);
    const sshConfig = await getSSHConfig(mockSSHConfig.configId);
    expect(sshConfig).toBeDefined();

    if (sshConfigExists) {
      // reset ssh config
      await fse.writeFile(sshConfigPath, originalSSHConfig, 'utf-8');
    }
  });

  test('update ssh config', async () => {
    let originalSSHConfig = '';
    const sshConfigExists = await fse.pathExists(sshConfigPath);
    if (sshConfigExists) {
      originalSSHConfig = await fse.readFile(sshConfigPath, 'utf-8');
    }
    const mockSSHConfig = {
      hostName: 'update-ssh-config.com',
      userName: 'update-one-ssh-config',
      configId: 'update-one-ssh-config',
    };
    await addSSHConfig(mockSSHConfig);
    const addedSSHConfig = await fse.readFile(sshConfigPath, 'utf-8');
    expect(addedSSHConfig.includes(mockSSHConfig.hostName)).toBeTruthy();

    const newHost = 'example.com';
    await updateSSHConfig(mockSSHConfig.configId, { Host: newHost });
    const sshConfig = await getSSHConfig(mockSSHConfig.configId);
    expect(sshConfig.Host).toBe(newHost);

    if (sshConfigExists) {
      // reset ssh config
      await fse.writeFile(sshConfigPath, originalSSHConfig, 'utf-8');
    }
  });

  test('remove ssh config', async () => {
    const mockSSHConfig = {
      hostName: 'remove-ssh-config.com',
      userName: 'remove-ssh-config',
      configId: 'remove-ssh-config',
    };
    await addSSHConfig(mockSSHConfig);
    const addedSSHConfig = await fse.readFile(sshConfigPath, 'utf-8');
    expect(addedSSHConfig.includes(mockSSHConfig.hostName)).toBeTruthy();

    await removeSSHConfig(mockSSHConfig.configId);
    const removedSSHConfig = await fse.readFile(sshConfigPath, 'utf-8');
    expect(removedSSHConfig.includes(mockSSHConfig.hostName)).toBeFalsy();
  });
});
