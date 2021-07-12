import { Table, Button, Message } from '@alifd/next';
// import BalloonConfirm from '@icedesign/balloon-confirm';
import { useEffect } from 'react';
import store from '../../store';
import styles from './index.module.scss';

function NpmDependency() {
  const [state, dispatcher] = store.useModel('npmDependency');
  const effectsState = store.useModelEffectsState('npmDependency');
  const { npmDependencies } = state;

  useEffect(() => {
    if (effectsState.getNpmDependencies.error) {
      Message.error(effectsState.getNpmDependencies.error.message);
    }
  }, [effectsState.getNpmDependencies.error]);

  const operationRender = (value, index, record) => {
    return (
      <>
        <Button text type="primary">重装</Button>
        <Button className={styles.button} text type="primary">删除</Button>
      </>
    );
  };

  const latestVersionRender = (value: string) => {
    return (
      <>
        {value}
        {value && <Button className={styles.button} text type="primary">升级</Button>}
      </>
    );
  };
  useEffect(() => {
    dispatcher.getNpmDependencies();
  }, []);
  return (
    <>
      <div className={styles.title}>全局 npm 依赖管理</div>
      <Table loading={effectsState.getNpmDependencies.isLoading} dataSource={npmDependencies} className={styles.table}>
        <Table.Column title="npm 依赖" dataIndex="name" />
        <Table.Column title="当前版本" dataIndex="currentVersion" />
        <Table.Column title="最新版本" dataIndex="latestVersion" cell={latestVersionRender} />
        <Table.Column title="操作" cell={operationRender} />
      </Table>
    </>
  );
}

export default NpmDependency;
