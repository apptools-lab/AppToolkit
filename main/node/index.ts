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

function processListener({ managerName, nodeVersion, installChannel, processChannel }) {
  const nodeManager = getNodeManager(managerName, installChannel);

  const task = 'installNode';

  install();

  async function install() {
    try {
      process.send({ channel: processChannel, data: { task, status: 'process' } });

      const result = await nodeManager.installNode(nodeVersion);
      process.send({ channel: processChannel, data: { task, status: 'success', result } });

      process.send({ channel: processChannel, data: { status: 'done' } });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : error;
      log.error(errMsg);
      process.send({ channel: processChannel, data: { task, status: 'error', errMsg } });
    }
  }
}

process.on('message', processListener);
