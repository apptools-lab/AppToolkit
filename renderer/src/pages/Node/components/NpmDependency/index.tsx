import { Table, Button, Message, Dropdown } from '@alifd/next';
import { useEffect } from 'react';
import { INpmDependency } from '@/interfaces/npmDependency';
import store from '../../store';
import InstallNpmDependency from '../InstallNpmDependency';
import OperationTableCell from '../OperationTableCell';
import LatestVersionTableCell from '../LatestVersionTableCell';
import styles from './index.module.scss';

const defaultTableColumnProps: any = {
  align: 'center',
  alignHeader: 'center',
  width: 140,
};

function NpmDependency() {
  const [state, dispatcher] = store.useModel('npmDependency');
  const effectsState = store.useModelEffectsState('npmDependency');
  const { npmDependencies } = state;

  useEffect(() => {
    if (effectsState.getGlobalNpmDependencies.error) {
      Message.error(effectsState.getGlobalNpmDependencies.error.message);
    }
  }, [effectsState.getGlobalNpmDependencies.error]);


  const operationCell = (value: any, index: number, record: INpmDependency) => {
    return <OperationTableCell index={index} record={record} />;
  };

  const latestVersionCell = (value: string, index: number, record: INpmDependency) => {
    return <LatestVersionTableCell value={value} index={index} record={record} />;
  };

  useEffect(() => {
    dispatcher.getGlobalNpmDependencies();
  }, []);
  return (
    <>
      <div className={styles.header}>
        <div className={styles.title}>全局 npm 依赖管理</div>
        <Dropdown trigger={<Button type="primary">添加依赖</Button>} triggerType={['click']}>
          <InstallNpmDependency />
        </Dropdown>
      </div>
      <Table loading={effectsState.getGlobalNpmDependencies.isLoading} dataSource={npmDependencies} className={styles.table}>
        <Table.Column {...defaultTableColumnProps} width={300} title="npm 依赖" dataIndex="name" />
        <Table.Column {...defaultTableColumnProps} title="当前版本" dataIndex="currentVersion" />
        <Table.Column {...defaultTableColumnProps} title="最新版本" dataIndex="latestVersion" cell={latestVersionCell} />
        <Table.Column {...defaultTableColumnProps} title="操作" cell={operationCell} />
      </Table>
    </>
  );
}

export default NpmDependency;
