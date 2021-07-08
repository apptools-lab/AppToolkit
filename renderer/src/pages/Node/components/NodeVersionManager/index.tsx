import { Grid, Button, Balloon } from '@alifd/next';
import { ipcRenderer } from 'electron';
import { IPackageInfo } from '@/interfaces';
import InstallStep from '../InstallStep';
import store from '../../store';
import styles from './index.module.scss';

const { Row, Col } = Grid;

const NodeVersionManager = () => {
  const [state, dispatchers] = store.useModel('node');
  const { nodeInstallVisible, nodeInfo, currentStep } = state;
  const { options = {}, localVersion, managerVersionStatus } = nodeInfo as IPackageInfo;
  const { managerName } = options;

  const INSTALL_NODE_CHANNEL = 'install-node';
  const INSTALL_PROCESS_STATUS_CHANNEL = 'install-node-process-status';

  const goBack = () => {
    dispatchers.setNodeInstallVisible(false);
    dispatchers.getNodeInfo();
  };

  const onSwitchVersionBtnClick = async () => {
    await dispatchers.clearCaches({ installChannel: INSTALL_NODE_CHANNEL, processChannel: INSTALL_PROCESS_STATUS_CHANNEL });
    dispatchers.initStep();
    dispatchers.initNodeInstall();
    dispatchers.setNodeInstallVisible(true);
  };

  const cancelNodeInstall = async () => {
    await dispatchers.clearCaches({ installChannel: INSTALL_NODE_CHANNEL, processChannel: INSTALL_PROCESS_STATUS_CHANNEL });
    await ipcRenderer.invoke(
      'cancel-install-node',
      INSTALL_NODE_CHANNEL,
    );
    goBack();
  };

  const switchNodeVersionBtn = (
    <Button
      text
      type="primary"
      disabled={managerVersionStatus === 'uninstalled'}
      className={styles.switchVersionBtn}
      onClick={onSwitchVersionBtnClick}
    >
      切换版本
    </Button>
  );

  const cannelInstallBtn = (currentStep !== 3 && nodeInstallVisible) ? (
    <div className={styles.cannelBtn}>
      <Button type="normal" onClick={cancelNodeInstall}>
        取消安装
      </Button>
    </div>
  ) : null;

  return (
    <>
      {
        nodeInstallVisible ? (
          <div className={styles.container}>
            {cannelInstallBtn}
            <InstallStep
              managerName={managerName}
              INSTALL_NODE_CHANNEL={INSTALL_NODE_CHANNEL}
              INSTALL_PROCESS_STATUS_CHANNEL={INSTALL_PROCESS_STATUS_CHANNEL}
              goBack={goBack}
            />
          </div>
        ) : (
          <Row className={styles.row}>
            <Col span={12}>
              <div className={styles.subTitle}>Node 版本</div>
            </Col>
            <Col span={12} className={styles.col}>
              {localVersion || 'Not Found'}
              {managerVersionStatus === 'uninstalled' ? (
                <Balloon trigger={switchNodeVersionBtn}>
                  请在首页安装 NVM 以更好安装和管理 Node 版本。
                </Balloon>
              ) : (
                <>{switchNodeVersionBtn}</>
              )}
            </Col>
          </Row>
        )}
    </>
  );
};

export default NodeVersionManager;
