import executeBashConfigFile from '../utils/executeBashConfigFile';
import NvmManager from './NvmManager';

const nodeManagerProcessor = {
  nvm: NvmManager,
};

export default (managerName: string) => {
  const NodeManager = nodeManagerProcessor[managerName];
  const nodeManager = new NodeManager();
  return nodeManager;
};

function processListener({ managerName, nodeVersion, isReinstallPackages }) {
  const NodeManager = nodeManagerProcessor[managerName];
  const nodeManager = new NodeManager();
  async function installNode() {
    await nodeManager.installNode(nodeVersion, isReinstallPackages);
    executeBashConfigFile('/Users/luhc228/.zshrc');
    process.send('finish');
  }
  installNode();
  // process.send(nodeManager);
}

process.on('message', processListener);
