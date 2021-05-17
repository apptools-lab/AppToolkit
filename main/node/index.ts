import log from '../utils/log';
import NvmManager from './NvmManager';

const nodeManagerProcessor = {
  nvm: NvmManager,
};

export default function getNodeManager(managerName: string, channel?: string) {
  const NodeManager = nodeManagerProcessor[managerName];
  if (!NodeManager) {
    throw new Error(`Node manager ${managerName} was not found.`);
  }
  const nodeManager = new NodeManager(channel);
  return nodeManager;
}

function processListener({ managerName, nodeVersion, reinstallGlobalDeps, installChannel, processChannel }) {
  const nodeManager = getNodeManager(managerName, installChannel);

  const tasks = ['installNode', 'reinstallPackages'];

  install();

  async function install() {
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      try {
        let result;

        if (task === tasks[0] || (task === tasks[1] && reinstallGlobalDeps)) {
          process.send({ channel: processChannel, data: { task, status: 'process' } });
          result = await nodeManager[task](nodeVersion, reinstallGlobalDeps);
        }
        process.send({ channel: processChannel, data: { task, status: 'success', result } });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : error;
        log.error(errMsg);
        process.send({ channel: processChannel, data: { task, status: 'error', errMsg } });
      }
    }
    process.send({ channel: processChannel, data: { status: 'done' } });
  }
}

process.on('message', processListener);
