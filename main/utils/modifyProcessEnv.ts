
import getEnvFromShell from './getEnvFromShell';

function modifyProcessEnv() {
  if (process.env.NODE_ENV === 'development') {
    return;
  }
  const env = getEnvFromShell(process.env.SHELL);
  // electron inject the resourcesPath, but can't get it in a child process. We need to get it from process.env.resourcesPath
  const { resourcesPath } = process;
  process.env = { ...process.env, ...env, resourcesPath };
}

export default modifyProcessEnv;
