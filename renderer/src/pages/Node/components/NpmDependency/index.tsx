import { Table, Button, Message, Icon, Dropdown } from '@alifd/next';
import BalloonConfirm from '@/components/BalloonConfirm';
import { useEffect } from 'react';
import { INpmDependency } from '@/interfaces/npmDependency';
import store from '../../store';
import InstallNpmDependency from '../InstallNpmDependency';
import styles from './index.module.scss';

function NpmDependency() {
  const [state, dispatcher] = store.useModel('npmDependency');
  const effectsState = store.useModelEffectsState('npmDependency');
  const { npmDependencies, curUpdateDepIndex, curUninstallDepIndex, curReinstallDepIndex } = state;

  useEffect(() => {
    if (effectsState.getGlobalNpmDependencies.error) {
      Message.error(effectsState.getGlobalNpmDependencies.error.message);
    }
  }, [effectsState.getGlobalNpmDependencies.error]);

  useEffect(() => {
    if (effectsState.uninstallGlobalNpmDependency.error) {
      Message.error(effectsState.uninstallGlobalNpmDependency.error.message);
    }
  }, [effectsState.uninstallGlobalNpmDependency.error]);

  useEffect(() => {
    if (effectsState.updateGlobalNpmDependency.error) {
      Message.error(effectsState.updateGlobalNpmDependency.error.message);
    }
  }, [effectsState.updateGlobalNpmDependency.error]);

  useEffect(() => {
    if (effectsState.reinstallGlobalNpmDependency.error) {
      Message.error(effectsState.reinstallGlobalNpmDependency.error.message);
    }
  }, [effectsState.reinstallGlobalNpmDependency.error]);

  const onUninstallGlobalDep = async (dependency: INpmDependency, index: number) => {
    dispatcher.addCurDepIndex({ type: 'uninstall', index });
    const { name } = dependency;
    await dispatcher.uninstallGlobalNpmDependency(name);
    dispatcher.removeCurDepIndex({ type: 'uninstall', index });
    Message.success(`卸载依赖 ${name} 成功`);
  };

  const onUpdateGlobalDep = async (dependency: INpmDependency, index: number) => {
    dispatcher.addCurDepIndex({ type: 'update', index });
    const { name } = dependency;
    await dispatcher.updateGlobalNpmDependency(dependency.name);
    dispatcher.removeCurDepIndex({ type: 'update', index });
    Message.success(`升级依赖 ${name} 成功`);
  };

  const onReinstallGlobalDep = async (dependency: INpmDependency, index: number) => {
    dispatcher.addCurDepIndex({ type: 'reinstall', index });
    const { name, currentVersion } = dependency;
    await dispatcher.reinstallGlobalNpmDependency({ dependency: name, version: currentVersion });
    dispatcher.removeCurDepIndex({ type: 'reinstall', index });
    Message.success(`重装依赖 ${name} 成功`);
  };

  const operationRender = (value: any, index: number, record: INpmDependency) => {
    const isReinstallCurrentDep = curReinstallDepIndex.includes(index) && effectsState.reinstallGlobalNpmDependency.isLoading;
    const isUninstallCurrentDep = curUninstallDepIndex.includes(index) && effectsState.uninstallGlobalNpmDependency.isLoading;

    return (
      <div className={styles.columnCell}>
        <BalloonConfirm
          onConfirm={async () => await onReinstallGlobalDep(record, index)}
          title="确定重装该依赖？"
          disable={isReinstallCurrentDep}
        >
          <Button
            text
            iconSize="xs"
            type="primary"
            icons={{ loading: <Icon type="loading" /> }}
            loading={isReinstallCurrentDep}
            disabled={isReinstallCurrentDep}
          >
            重装
          </Button>
        </BalloonConfirm>
        <BalloonConfirm
          onConfirm={async () => await onUninstallGlobalDep(record, index)}
          title="确定卸载该依赖？"
          disable={isUninstallCurrentDep}
        >
          <Button
            className={styles.button}
            text
            iconSize="xs"
            type="primary"
            icons={{ loading: <Icon type="loading" /> }}
            loading={isUninstallCurrentDep}
            disabled={isUninstallCurrentDep}
          >卸载
          </Button>
        </BalloonConfirm>
      </div>
    );
  };

  const latestVersionRender = (value: string, index: number, record: INpmDependency) => {
    const isUpdateGlobalDep = curUpdateDepIndex.includes(index) && effectsState.updateGlobalNpmDependency.isLoading;

    return (
      <div className={styles.columnCell}>
        <span>{value}</span>
        {value && (
        <Button
          className={styles.button}
          text
          iconSize="xs"
          type="primary"
          icons={{ loading: <Icon type="loading" /> }}
          onClick={async () => await onUpdateGlobalDep(record, index)}
          loading={isUpdateGlobalDep}
          disabled={isUpdateGlobalDep}
        >
          升级
        </Button>
        )}
      </div>
    );
  };

  useEffect(() => {
    dispatcher.getGlobalNpmDependencies();
  }, []);
  return (
    <>
      <div className={styles.title}>全局 npm 依赖管理</div>
      <Dropdown trigger={<Button type="primary" className={styles.addDepBtn}>添加依赖</Button>} triggerType={['click']}>
        <InstallNpmDependency />
      </Dropdown>
      <Table loading={effectsState.getGlobalNpmDependencies.isLoading} dataSource={npmDependencies} className={styles.table}>
        <Table.Column title="npm 依赖" dataIndex="name" width={200} />
        <Table.Column title="当前版本" dataIndex="currentVersion" width={200} />
        <Table.Column title="最新版本" dataIndex="latestVersion" cell={latestVersionRender} width={200} />
        <Table.Column title="操作" cell={operationRender} width={200} />
      </Table>
    </>
  );
}

export default NpmDependency;
