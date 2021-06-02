import { useEffect } from 'react';
import { Grid, Button, Balloon } from '@alifd/next';
import { ipcRenderer } from 'electron';
import PageHeader from '@/components/PageHeader';
import { IBasePackage } from '@/interfaces';
import styles from './index.module.scss';
import store from './store';
import InstallStep from './components/InstallStep';

const { Row, Col } = Grid;

const Node = () => {
  const [state, dispatchers] = store.useModel('node');
  const { nodeInfo, currentStep, nodeInstallVisible } = state;
  const { options = {}, localVersion, managerVersion } = nodeInfo as IBasePackage;
  const { managerName } = options;

  const INSTALL_NODE_CHANNEL = 'install-node';
  const INSTALL_PROCESS_STATUS_CHANNEL = 'install-node-process-status';
  const onSwitchVersionBtnClick = async () => {
    await dispatchers.clearCaches({ installChannel: INSTALL_NODE_CHANNEL, processChannel: INSTALL_PROCESS_STATUS_CHANNEL });
    dispatchers.initStep();
    dispatchers.initNodeInstall();
    dispatchers.setNodeInstallVisible(true);
  };

  const getNodeInfo = async function () {
    await dispatchers.getNodeInfo();
  };

  useEffect(() => {
    getNodeInfo();
  }, []);

  const goBack = async () => {
    dispatchers.setNodeInstallVisible(false);
    await getNodeInfo();
  };

  const cancelNodeInstall = async () => {
    await dispatchers.clearCaches({ installChannel: INSTALL_NODE_CHANNEL, processChannel: INSTALL_PROCESS_STATUS_CHANNEL });
    await ipcRenderer.invoke(
      'cancel-install-node',
      { installChannel: INSTALL_NODE_CHANNEL, processChannel: INSTALL_PROCESS_STATUS_CHANNEL },
    );
    goBack();
  };

  const headerBtn = (currentStep !== 3 && nodeInstallVisible) ? (
    <Button type="normal" onClick={cancelNodeInstall}>
      取消安装
    </Button>
  ) : null;

  const switchNodeVersionBtn = (
    <Button
      text
      type="primary"
      disabled={!managerVersion}
      className={styles.switchVersionBtn}
      onClick={onSwitchVersionBtnClick}
    >
      切换版本
    </Button>
  );
  return (
    <div className={styles.nodeContainer}>
      <PageHeader title="Node 管理" button={headerBtn} />
      {
        nodeInstallVisible ? (
          <InstallStep
            managerName={managerName}
            INSTALL_NODE_CHANNEL={INSTALL_NODE_CHANNEL}
            INSTALL_PROCESS_STATUS_CHANNEL={INSTALL_PROCESS_STATUS_CHANNEL}
            goBack={goBack}
          />
        ) : (
          <Row className={styles.row}>
            <Col span={12}>
              <div className={styles.subTitle}>Node 版本</div>
            </Col>
            <Col span={12} className={styles.col}>
              {localVersion || 'Not Found'}
              {!managerVersion ? (
                <Balloon trigger={switchNodeVersionBtn}>
                  请在首页安装 NVM 以更好安装和管理 Node 版本。
                </Balloon>
              ) : (
                <>{switchNodeVersionBtn}</>)
              }
            </Col>
          </Row>
        )
      }
    </div>
  );
};

export default Node;
