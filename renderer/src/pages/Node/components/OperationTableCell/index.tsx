import { Button, Message, Icon, Balloon } from '@alifd/next';
import BalloonConfirm from '@/components/BalloonConfirm';
import { INpmDependency } from '@/interfaces/npmDependency';
import CustomIcon from '@/components/Icon';
import { useEffect } from 'react';
import store from '../../store';
import styles from './index.module.scss';

const { Tooltip } = Balloon;

const OperationTableCell = ({ index, record }) => {
  const [state, dispatcher] = store.useModel('npmDependency');
  const effectsState = store.useModelEffectsState('npmDependency');
  const { curUninstallDepIndex, curReinstallDepIndex } = state;

  useEffect(() => {
    if (effectsState.reinstallGlobalNpmDependency.error) {
      Message.error(effectsState.reinstallGlobalNpmDependency.error.message);
    }
  }, [effectsState.reinstallGlobalNpmDependency.error]);

  useEffect(() => {
    if (effectsState.uninstallGlobalNpmDependency.error) {
      Message.error(effectsState.uninstallGlobalNpmDependency.error.message);
    }
  }, [effectsState.uninstallGlobalNpmDependency.error]);

  const onReinstallGlobalDep = async (dependency: INpmDependency, i: number) => {
    dispatcher.addCurDepIndex({ type: 'reinstall', index });
    const { name, currentVersion } = dependency;
    await dispatcher.reinstallGlobalNpmDependency({ dependency: name, version: currentVersion });
    dispatcher.removeCurDepIndex({ type: 'reinstall', index: i });
    Message.success(`重装依赖 ${name}@${currentVersion} 成功`);
    await dispatcher.getGlobalNpmDependencies(true);
  };

  const onUninstallGlobalDep = async (dependency: INpmDependency, i: number) => {
    dispatcher.addCurDepIndex({ type: 'uninstall', index });
    const { name } = dependency;
    await dispatcher.uninstallGlobalNpmDependency(name);
    dispatcher.removeCurDepIndex({ type: 'uninstall', index: i });
    Message.success(`卸载依赖 ${name} 成功`);
    await dispatcher.getGlobalNpmDependencies(true);
  };

  const isReinstallCurrentDep = curReinstallDepIndex.includes(index) && effectsState.reinstallGlobalNpmDependency.isLoading;
  const isUninstallCurrentDep = curUninstallDepIndex.includes(index) && effectsState.uninstallGlobalNpmDependency.isLoading;

  return (
    <div className={styles.columnCell}>
      <BalloonConfirm
        onConfirm={async () => await onReinstallGlobalDep(record, index)}
        title="确定重装该依赖？"
        disable={isReinstallCurrentDep}
      >
        <Tooltip
          trigger={
            <Button
              text
              type="primary"
              disabled={isReinstallCurrentDep}
            >
              {isReinstallCurrentDep ? <Icon type="loading" style={{ fontSize: 18 }} /> : <CustomIcon type="shuaxin" style={{ fontSize: 18 }} />}
            </Button>
          }
          align="t"
        >
          重装
        </Tooltip>
      </BalloonConfirm>
      <BalloonConfirm
        onConfirm={async () => await onUninstallGlobalDep(record, index)}
        title="确定卸载该依赖？"
        disable={isUninstallCurrentDep}
      >
        <Tooltip
          trigger={
            <Button
              className={styles.button}
              text
              type="primary"
              disabled={isUninstallCurrentDep}
            >
              {isUninstallCurrentDep ? <Icon type="loading" style={{ fontSize: 18 }} /> : <CustomIcon type="trash" style={{ fontSize: 18 }} />}
            </Button>
            }
          align="t"
        >
          卸载
        </Tooltip>
      </BalloonConfirm>
    </div>
  );
};

export default OperationTableCell;
