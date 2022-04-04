import { test, describe, expect } from 'vitest';
import { getGlobalConfig, setGlobalConfig } from '../src/git';

describe('config', () => {
  test('get global config', async () => {
    const globalConfig = await getGlobalConfig();
    expect(globalConfig).toBeDefined();
  });

  test('set global config', async () => {
    const originGlobalConfig = await getGlobalConfig();
    const testGlobalConfig = { 
      'user.name': 'test', 
      'user.email': 'test@example.com' 
    }

    await setGlobalConfig(testGlobalConfig);
    const newGlobalConfig = await getGlobalConfig();
    expect(newGlobalConfig['user.name']).toBe(testGlobalConfig['user.name']);
    expect(newGlobalConfig['user.email']).toBe(testGlobalConfig['user.email']);
    // reset the global config
    await setGlobalConfig(originGlobalConfig);
  })
})
