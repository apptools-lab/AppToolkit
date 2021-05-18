import * as isDev from 'electron-is-dev';
import getEnvFromShell from './getEnvFromShell';

function modifyProcessEnv() {
  if (isDev) {
    return;
  }
  const env = getEnvFromShell(process.env.SHELL);
  process.env = { ...process.env, ...env };
}

export default modifyProcessEnv;
