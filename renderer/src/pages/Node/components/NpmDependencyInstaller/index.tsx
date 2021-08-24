import { useEffect } from 'react';
import { Input, Icon, Table, Button, Message, Balloon } from '@alifd/next';
import { ISearchNpmDependency } from '@/interfaces/node';
import CustomIcon from '@/components/Icon';
import store from '../../store';
import styles from './index.module.scss';

const { Tooltip } = Balloon;

const defaultTableColumnProps: any = {
  align: 'center',
  alignHeader: 'center',
  width: 80,
};

function NpmDependencyInstaller() {
  const [state, dispatcher] = store.useModel('npmDependency');
  const { searchValue, queryNpmDependencies, curInstallDepIndex } = state;
  const effectsState = store.useModelEffectsState('npmDependency');

  const onSearch = () => {
    if (!searchValue) {
      Message.error('请输入 npm 依赖名称');
      return;
    }
    dispatcher.searchNpmDependencies(searchValue);
  };

  const homepageRender = (value: string) => {
    return <>{value && <a href={value} target="__blank">查看</a>}</>;
  };

  const onInstallGlobalDep = async (dependency: ISearchNpmDependency, index: number) => {
    dispatcher.addCurDepIndex({ type: 'install', index });
    const { name, version } = dependency;
    await dispatcher.installGlobalNpmDependency({ dependency: name, version });
    dispatcher.removeCurDepIndex({ type: 'install', index });
    Message.success(`安装依赖 ${name}@${version} 成功`);
    await dispatcher.getGlobalNpmDependencies(true);
    await dispatcher.searchNpmDependencies(searchValue);
  };

  const operationRender = (value: any, index: number, record: ISearchNpmDependency) => {
    const isInstallGlobalDep = curInstallDepIndex.includes(index) && effectsState.installGlobalNpmDependency.isLoading;
    return (
      <>
        {
          record.isInstalled ? (
            <span style={{ color: 'gray' }}>已安装</span>
          ) : (
            <Tooltip
              trigger={
                <Button
                  text
                  type="primary"
                  onClick={async () => await onInstallGlobalDep(record, index)}
                  disabled={isInstallGlobalDep}
                >
                  {isInstallGlobalDep ? <Icon type="loading" /> : <CustomIcon type="xiazai" />}
                </Button>
              }
              align="t"
            >
              安装
            </Tooltip>
          )}
      </>
    );
  };

  useEffect(() => {
    if (effectsState.searchNpmDependencies.error) {
      Message.error(effectsState.searchNpmDependencies.error.message);
    }
  }, [effectsState.searchNpmDependencies.error]);

  useEffect(() => {
    if (effectsState.installGlobalNpmDependency.error) {
      Message.error(effectsState.installGlobalNpmDependency.error.message);
    }
  }, [effectsState.installGlobalNpmDependency.error]);
  return (
    <div className={styles.container}>
      <Input
        className={styles.searchInput}
        onPressEnter={onSearch}
        innerAfter={
          <Icon
            type="search"
            size="xs"
            onClick={onSearch}
            className={styles.searchIcon}
          />
          }
        placeholder="搜索"
        value={searchValue}
        aria-label="input with config of innerAfter"
        onChange={(value: string) => dispatcher.updateSearchValue(value)}
      />
      <Table dataSource={queryNpmDependencies} className={styles.table} loading={effectsState.searchNpmDependencies.isLoading}>
        <Table.Column {...defaultTableColumnProps} title="npm 依赖" dataIndex="name" width={120} />
        <Table.Column {...defaultTableColumnProps} title="版本" dataIndex="version" />
        <Table.Column {...defaultTableColumnProps} title="主页" dataIndex="homepage" cell={homepageRender} />
        <Table.Column {...defaultTableColumnProps} title="操作" cell={operationRender} />
      </Table>
    </div>
  );
}

export default NpmDependencyInstaller;
