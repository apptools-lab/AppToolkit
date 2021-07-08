import { useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import styles from './index.module.scss';
import store from './store';
import NodeVersionManager from './components/NodeVersionManager';

const Node = () => {
  const [, dispatchers] = store.useModel('node');

  useEffect(() => {
    dispatchers.getNodeInfo();
  }, []);

  return (
    <div className={styles.nodeContainer}>
      <PageHeader title="Node 管理" />
      <NodeVersionManager />
    </div>
  );
};

export default Node;
