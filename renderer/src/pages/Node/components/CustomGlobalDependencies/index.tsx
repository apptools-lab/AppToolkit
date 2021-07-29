import { useEffect } from 'react';
import { Grid, Button, Balloon, Input, Icon, Message } from '@alifd/next';
import cn from 'classnames';
import CustomGlobalDepsPathDialog from '../CustomGlobalDepsPathDialog';
import store from '../../store';
import styles from './index.module.scss';

const { Row, Col } = Grid;
const { Tooltip } = Balloon;

const CustomGlobalDependencies = () => {
  const [state, dispatchers] = store.useModel('npmDependency');
  const effectsState = store.useModelEffectsState('npmDependency');
  const { globalDependenciesInfo } = state;

  useEffect(() => {
    dispatchers.getGlobalDependenciesPath();
  }, []);

  useEffect(() => {
    if (effectsState.getGlobalDependenciesPath.error) {
      Message.error(effectsState.getGlobalDependenciesPath.error.message);
    }
  }, [effectsState.getGlobalDependenciesPath.error]);

  const onDialogShow = () => {
    dispatchers.setCustomGlobalDepsDialogVisible(true);
  };

  const setCustomGlobalDepsTooltip = (
    <Tooltip trigger={<Icon type="prompt" className={styles.warningIcon} />} align="lt" delay={200} className={styles.tooltip}>
      切换到其他 Node 版本后全局依赖会消失，建议在 {globalDependenciesInfo.recommendedPath} 存放全局依赖，这样在新 Node 版本中仍然可用。
      <Button text onClick={onDialogShow} type="primary">开始设置</Button>
    </Tooltip>
  );
  return (
    <>
      <Row className={styles.row}>
        <Col span={10}>
          <div className={styles.subTitle}>
            全局 npm 依赖路径
            <Tooltip trigger={<Icon type="prompt" />}>更新</Tooltip>
          </div>
        </Col>
        <Col span={14} className={styles.col}>
          <Input
            className={cn(styles.input, { [styles.warningInput]: !globalDependenciesInfo.exists })}
            readOnly
            value={globalDependenciesInfo.currentPath}
            innerAfter={globalDependenciesInfo.exists ? null : setCustomGlobalDepsTooltip}
          />
        </Col>
      </Row>
      <CustomGlobalDepsPathDialog />
    </>
  );
};

export default CustomGlobalDependencies;
