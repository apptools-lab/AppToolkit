import * as child_process from 'child_process';

function killChannelChildProcess(
  channelChildProcessMap: Map<string, child_process.ChildProcess>,
  channel: string,
) {
  const childProcess = channelChildProcessMap.get(channel);
  if (childProcess && childProcess.kill instanceof Function) {
    // kill child process
    childProcess.kill();
    channelChildProcessMap.delete(channel);
  }
}

export default killChannelChildProcess;
