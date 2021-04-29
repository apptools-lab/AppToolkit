import { useEffect, useState } from 'react';
import { Grid, Button } from '@alifd/next';
import PageHeader from '@/components/PageHeader';
import { IBasePackage } from '@/interfaces';
import { ipcRenderer } from 'electron';
import styles from './index.module.scss';
import store from './store';
import SwitchVersionDialog from './components/SwitchVersionDialog';

const { Row, Col } = Grid;

const Node = () => {
  const [visible, setVisible] = useState(false);

  const [state, dispatchers] = store.useModel('node');
  const { nodeInfo } = state;
  const { options = {} } = nodeInfo as IBasePackage;
  const { managerName } = options;
  const { localVersion } = nodeInfo as IBasePackage;

  const onSwitchVersionBtnClick = () => {
    onDialogOpen();
  };

  const onDialogClose = () => {
    setVisible(false);
  };

  const onDialogOpen = () => {
    setVisible(true);
  };

  const onDialogConfirm = async ({ reinstallGlobalDeps, nodeVersion }) => {
    await ipcRenderer.invoke('install-node', managerName, nodeVersion, reinstallGlobalDeps);
  };

  useEffect(() => {
    const init = async function () {
      await dispatchers.getNodeInfo();
    };
    init();
  }, []);

  return (
    <div className={styles.nodeContainer}>
      <PageHeader title="Node 管理" />
      <main>
        <Row className={styles.row}>
          <Col span={12}>
            <div className={styles.subTitle}>Node 版本</div>
          </Col>
          <Col span={12}>
            {localVersion}
            <Button
              text
              type="primary"
              className={styles.switchVersionBtn}
              onClick={onSwitchVersionBtnClick}
            >
              切换版本
            </Button>
          </Col>
        </Row>
      </main>
      {visible && (
        <SwitchVersionDialog
          managerName={managerName}
          onCancel={onDialogClose}
          onOk={onDialogConfirm}
        />
      )}
    </div>
  );
};

export default Node;
