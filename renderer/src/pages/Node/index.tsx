import { useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import styles from './index.module.scss';
import store from './store';
import NodeVersion from './components/NodeVersion';
import NpmRegistry from './components/NpmRegistry';

const Node = () => {
  const [state, dispatchers] = store.useModel('node');
  const { nodeInstallVisible } = state;

  useEffect(() => {
    dispatchers.getNodeInfo();
  }, []);

  return (
    <div className={styles.nodeContainer}>
      <PageHeader title="Node 管理" />
      <main>
        <NodeVersion />
        {!nodeInstallVisible && <NpmRegistry />}
      </main>
    </div>
  );
};

export default Node;
