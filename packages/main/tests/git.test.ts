import { test, describe, expect } from 'vitest';
import { 
  getGlobalConfig, 
  setGlobalConfig,
  addUserConfig,
  getUserConfig,
  setUserConfig,
  removeUserConfig,
} from '../src/git';
import * as path from 'path';
import * as fse from 'fs-extra';

const userConfigTestId = 'test-git-user-config';
const testGlobalConfig = { 
  'user.name': 'test', 
  'user.email': 'test@example.com' 
};

describe('config', () => {
  test('get global config', async () => {
    const globalConfig = await getGlobalConfig();
    expect(globalConfig).toBeDefined();
  });

  test('set global config', async () => {
    const originGlobalConfig = await getGlobalConfig();
    await setGlobalConfig(testGlobalConfig);
    const newGlobalConfig = await getGlobalConfig();
    expect(newGlobalConfig['user.name']).toBe(testGlobalConfig['user.name']);
    expect(newGlobalConfig['user.email']).toBe(testGlobalConfig['user.email']);
    // reset the global config
    await setGlobalConfig(originGlobalConfig);
  });

  test('add user config', async () => {
    const userConfigPath = await addUserConfig(userConfigTestId);
    expect(userConfigPath).not.toBeUndefined();
  
    await fse.remove(path.join(path.dirname(userConfigPath), '..'));
  });

  test('remove user config', async () => {
    const userConfigPath = await addUserConfig(userConfigTestId);
    await removeUserConfig(userConfigTestId);
   
    expect(await fse.pathExists(userConfigPath)).toBe(false);
  });

  test('get user config', async () => {
    const userConfigPath = await addUserConfig(userConfigTestId);
    const userConfig = await getUserConfig(userConfigTestId);
    expect(userConfig).toBeDefined();

    await fse.remove(path.join(path.dirname(userConfigPath), '..'));
  });

  test('set user config', async () => {
    const userConfigPath = await addUserConfig(userConfigTestId);
    await setUserConfig(userConfigTestId, testGlobalConfig);
    const newGlobalConfig = await getUserConfig(userConfigTestId);

    expect(newGlobalConfig['user.name']).toBe(testGlobalConfig['user.name']);
    expect(newGlobalConfig['user.email']).toBe(testGlobalConfig['user.email']);
    
    await fse.remove(path.join(path.dirname(userConfigPath), '..'));
  });
})
