import { Grid, Button, Balloon } from '@alifd/next';
import { IPackageInfo } from '@/interfaces';
import NodeInstaller from '../NodeInstaller';
import store from '../../store';
import styles from './index.module.scss';

const { Row, Col } = Grid;

const NodeVersion = ({ goBack }) => {
  const [state, dispatchers] = store.useModel('node');
  const { nodeInstallVisible, nodeInfo, nodeInstallChannel, nodeInstallProcessStatusChannel } = state;
  const { options = {}, localVersion, managerVersionStatus } = nodeInfo as IPackageInfo;
  const { managerName } = options;

  const onSwitchVersionBtnClick = async () => {
    await dispatchers.clearCaches({ installChannel: nodeInstallChannel, processChannel: nodeInstallProcessStatusChannel });
    dispatchers.initStep();
    dispatchers.initNodeInstall();
    dispatchers.setNodeInstallVisible(true);
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

  // const cannelInstallBtn = (currentStep !== 3 && nodeInstallVisible) ? (
  //   <div className={styles.cannelBtn}>
  //     <Button type="normal" onClick={cancelNodeInstall}>
  //       取消安装
  //     </Button>
  //   </div>
  // ) : null;

  return (
    <>
      {
        nodeInstallVisible ? (
          <NodeInstaller
            managerName={managerName}
            goBack={goBack}
          />
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

export default NodeVersion;
