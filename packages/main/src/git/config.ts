import simpleGit from 'simple-git';
import type { GitConfigScope } from 'simple-git';

type GitConfig = Record<string, string>;

export async function getGlobalConfig() {
  const allGlobalConfig = await getConfigList({ scope: 'global' });
  const { files: [globalConfigKey], values } = allGlobalConfig;

  const globalConfig = {
    ...values[globalConfigKey],
  } as Record<string, string>;

  return globalConfig;
}

export async function setGlobalConfig(config: GitConfig) {
  await setConfig({ config, scope: 'global' });
}

async function getConfigList({ baseDir, scope }: { baseDir?: string; scope: keyof typeof GitConfigScope }) {
  const git = simpleGit({ baseDir });
  return git.listConfig(scope);
}

async function setConfig({
  config,
  scope,
  baseDir,
}: {
  config: Record<string, string>;
  scope: keyof typeof GitConfigScope;
  baseDir?: string;
}) {
  const git = simpleGit({ baseDir });
  const configKeys = Object.keys(config);
  for (const key of configKeys) {
    const value = config[key];
    await git.addConfig(key, value, false, scope);
  }
}