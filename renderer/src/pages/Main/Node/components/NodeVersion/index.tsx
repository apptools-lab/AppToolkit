import { Grid, Button, Balloon } from '@alifd/next';
import { NodeInfo } from '@/types/base';
import store from '@/pages/Main/store';
import styles from './index.module.scss';

const { Row, Col } = Grid;

const NodeVersion = () => {
  const [state, dispatchers] = store.useModel('nodeVersion');
  const { nodeInfo, nodeInstallChannel, nodeInstallProcessStatusChannel } = state;
  const { localVersion, managerVersionStatus } = nodeInfo as NodeInfo;

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

  return (
    <Row className={styles.row}>
      <Col span={10}>
        <div className={styles.subTitle}>Node 版本</div>
      </Col>
      <Col span={14} className={styles.col}>
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
  );
};

export default NodeVersion;
