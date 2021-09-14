import { INpmDependency } from '@/types/node';
import { Button, Message, Icon, Balloon } from '@alifd/next';
import CustomIcon from '@/components/Icon';
import { useEffect } from 'react';
import store from '@/pages/Main/store';
import styles from './index.module.scss';

const { Tooltip } = Balloon;

const LatestVersionTableCell = ({ index, value, record }) => {
  const [state, dispatcher] = store.useModel('npmDependency');
  const effectsState = store.useModelEffectsState('npmDependency');
  const { curUpdateDepIndex } = state;

  const isUpdateGlobalDep = curUpdateDepIndex.includes(index) && effectsState.updateGlobalNpmDependency.isLoading;
  useEffect(() => {
    if (effectsState.updateGlobalNpmDependency.error) {
      Message.error(effectsState.updateGlobalNpmDependency.error.message);
    }
  }, [effectsState.updateGlobalNpmDependency.error]);

  const onUpdateGlobalDep = async (dependency: INpmDependency, i: number) => {
    dispatcher.addCurDepIndex({ type: 'update', index });
    const { name } = dependency;
    await dispatcher.updateGlobalNpmDependency(dependency.name);
    dispatcher.removeCurDepIndex({ type: 'update', index: i });
    Message.success(`升级依赖 ${name} 成功`);
    await dispatcher.getGlobalNpmDependencies(true);
  };
  return (
    <div className={styles.columnCell}>
      <span>{value}</span>
      {record.isOutdated && (
      <Tooltip
        trigger={
          <Button
            className={styles.button}
            text
            type="primary"
            onClick={async () => await onUpdateGlobalDep(record, index)}
            disabled={isUpdateGlobalDep}
          >
            {isUpdateGlobalDep ? <Icon type="loading" style={{ fontSize: 18 }} /> : <CustomIcon type="jiantou" />}
          </Button>
            }
        align="t"
      >
        更新
      </Tooltip>
      )}
    </div>
  );
};

export default LatestVersionTableCell;
