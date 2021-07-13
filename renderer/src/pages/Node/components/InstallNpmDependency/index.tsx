import { Input, Icon, Table, Button, Message } from '@alifd/next';
import { ISearchNpmDependency } from '@/interfaces/npmDependency';
import store from '../../store';
import styles from './index.module.scss';

function InstallNpmDependency() {
  const [state, dispatcher] = store.useModel('npmDependency');
  const { searchValue, queryNpmDependencies, curInstallDepIndex } = state;
  const effectsState = store.useModelEffectsState('npmDependency');

  const onSearch = () => {
    dispatcher.searchNpmDependencies(searchValue);
  };

  const repoRender = (value: string) => {
    return <a href={value} target="__blank">查看仓库</a>;
  };

  const onInstallGlobalDep = async (dependency: ISearchNpmDependency, index: number) => {
    dispatcher.addCurDepIndex({ type: 'install', index });
    const { name, version } = dependency;
    await dispatcher.installGlobalNpmDependency({ dependency: name, version });
    dispatcher.removeCurDepIndex({ type: 'install', index });
    Message.success(`安装依赖 ${name} 成功`);
  };

  const operationRender = (value: any, index: number, record: ISearchNpmDependency) => {
    const isInstallGlobalDep = curInstallDepIndex.includes(index) && effectsState.installGlobalNpmDependency.isLoading;
    return (
      <Button
        text
        iconSize="xs"
        type="primary"
        icons={{ loading: <Icon type="loading" /> }}
        onClick={async () => await onInstallGlobalDep(record, index)}
        loading={isInstallGlobalDep}
        disabled={isInstallGlobalDep}
      >
        安装
      </Button>
    );
  };

  return (
    <div className={styles.container}>
      <Input
        innerAfter={
          <Icon
            type="search"
            size="xs"
            onClick={onSearch}
            style={{ margin: 4 }}
          />
          }
        placeholder="搜索"
        value={searchValue}
        aria-label="input with config of innerAfter"
        onChange={(value: string) => dispatcher.updateSearchValue(value)}
      />
      <Table dataSource={queryNpmDependencies} className={styles.table}>
        <Table.Column title="npm 依赖" dataIndex="name" width={100} />
        <Table.Column title="版本" dataIndex="version" width={100} />
        <Table.Column title="仓库" dataIndex="repository" cell={repoRender} width={100} />
        <Table.Column title="操作" cell={operationRender} width={100} />
      </Table>
    </div>
  );
}

export default InstallNpmDependency;
