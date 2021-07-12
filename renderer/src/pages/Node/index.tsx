import { useEffect } from 'react';
import { Button } from '@alifd/next';
import { ipcRenderer } from 'electron';
import PageHeader from '@/components/PageHeader';
import styles from './index.module.scss';
import store from './store';
import NodeVersion from './components/NodeVersion';
import NpmRegistry from './components/NpmRegistry';

const Node = () => {
  const [nodeVersionState, nodeVersionDispatchers] = store.useModel('nodeVersion');
  const { nodeInstallVisible, nodeInstallChannel, nodeInstallProcessStatusChannel, currentStep } = nodeVersionState;

  useEffect(() => {
    nodeVersionDispatchers.getNodeInfo();
  }, []);

  const goBack = () => {
    nodeVersionDispatchers.setNodeInstallVisible(false);
    nodeVersionDispatchers.getNodeInfo();
  };

  const cancelNodeInstall = async () => {
    await nodeVersionDispatchers.clearCaches({
      installChannel: nodeInstallChannel,
      processChannel: nodeInstallProcessStatusChannel,
    });
    await ipcRenderer.invoke(
      'cancel-install-node',
      nodeInstallChannel,
    );
    goBack();
  };

  const cannelInstallBtn = (currentStep !== 3 && nodeInstallVisible) ? (
    <div className={styles.cannelBtn}>
      <Button type="normal" onClick={cancelNodeInstall}>
        取消安装
      </Button>
    </div>
  ) : null;
  return (
    <div className={styles.nodeContainer}>
      <PageHeader title="Node 管理" button={nodeInstallVisible ? cannelInstallBtn : null} />
      <main>
        <NodeVersion goBack={goBack} />
        {!nodeInstallVisible && <NpmRegistry />}
      </main>
    </div>
  );
};

export default Node;
