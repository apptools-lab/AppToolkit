import * as spawn from 'cross-spawn';

function executeCommandJSON<T>(command: string, args: string[] = [], options = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const spawnChildProcess = spawn(command, args, options);
    let stdout = '';
    let stderr = '';
    spawnChildProcess.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });
    spawnChildProcess.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });
    spawnChildProcess.on('exit', () => {
      resolve(stdout ? JSON.parse(stdout) : {});
    });
    spawnChildProcess.on('error', () => {
      reject(stderr);
    });
  });
}

export default executeCommandJSON;

