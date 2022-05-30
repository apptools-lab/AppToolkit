import spawn from 'cross-spawn';

function executeCommand(command: string, args: string[] = [], options = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const spawnChildProcess = spawn(command, args, options);
    let stdout = '';
    let stderr = '';
    if (spawnChildProcess.stdout) {
      spawnChildProcess.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
    }
    if (spawnChildProcess.stderr) {
      spawnChildProcess.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
    }
    spawnChildProcess.on('exit', () => {
      resolve(stdout || '');
    });
    spawnChildProcess.on('error', () => {
      reject(stderr);
    });
  });
}

export default executeCommand;

