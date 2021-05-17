import log from '../utils/log';
import NvmManager from './NvmManager';

const nodeManagerProcessor = {
  nvm: NvmManager,
};

export default function getNodeManager(managerName: string, channel?: string) {
  const NodeManager = nodeManagerProcessor[managerName];
  if (!NodeManager) {
    throw new Error(`Node manager ${managerName} class was not found.`);
  }
  const nodeManager = new NodeManager(channel);
  return nodeManager;
}

function processListener({ managerName, nodeVersion, reinstallGlobalDeps, installChannel, processChannel }) {
  const nodeManager = getNodeManager(managerName, installChannel);

  async function installNode() {
    try {
      process.send({ channel: processChannel, data: { status: 'process' } });
      const result = await nodeManager.installNode(nodeVersion, reinstallGlobalDeps);
      process.send({ channel: processChannel, data: { status: 'success', result } });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : error;
      log.error(errMsg);
      process.send({ channel: processChannel, data: { status: 'error', errMsg } });
    }
  }

  installNode();
}

process.on('message', processListener);
