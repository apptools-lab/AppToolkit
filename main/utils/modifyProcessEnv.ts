
import getEnvFromShell from './getEnvFromShell';

function modifyProcessEnv() {
  if (process.env.NODE_ENV === 'development') {
    return;
  }
  const env = getEnvFromShell(process.env.SHELL);
  process.env = { ...process.env, ...env };
}

export default modifyProcessEnv;
