import { useEffect } from 'react';
import { Button } from '@alifd/next';
import { ipcRenderer } from 'electron';
import PageContainer from '@/components/PageContainer';
import styles from './index.module.scss';
import store from './store';
import NodeVersion from './components/NodeVersion';
import NpmRegistry from './components/NpmRegistry';
import NodeInstaller from './components/NodeInstaller';
import NpmDependency from './components/NpmDependency';

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

  const cannelInstallBtn = (currentStep !== 2 && nodeInstallVisible) ? (
    <div className={styles.cannelBtn}>
      <Button type="normal" onClick={cancelNodeInstall}>
        取消安装
      </Button>
    </div>
  ) : null;
  return (
    <PageContainer title="Node 管理" button={nodeInstallVisible ? cannelInstallBtn : null} >
      <main className={styles.main}>
        {nodeInstallVisible ? (
          <NodeInstaller goBack={goBack} />
        ) : (
          <>
            <NodeVersion />
            <NpmRegistry />
            <NpmDependency />
          </>
        )}
      </main>
    </PageContainer>
  );
};

export default Node;
