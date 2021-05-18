import * as execa from 'execa';

function getEnvFromShell(shell = process.env.SHELL) {
  const { stdout } = execa.sync(shell, ['-ilc', 'command env'], { encoding: 'utf8' });
  const result: { [k: string]: string } = {};
  if (stdout) {
    for (const line of stdout.split('\n')) {
      if (line.includes('=')) {
        const components = line.split('=');
        const key = components.shift();
        const value = components.join('=');
        result[key] = value;
      }
    }
  }
  return result;
}

export default getEnvFromShell;

