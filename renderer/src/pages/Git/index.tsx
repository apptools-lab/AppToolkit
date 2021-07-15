import { Button } from '@alifd/next';
import PageHeader from '@/components/PageHeader';
import styles from './index.module.scss';
import GlobalConfig from './components/GlobalConfig';

function Git() {
  const addConfigBtn = <Button type="primary">新增配置</Button>;

  return (
    <div className={styles.container}>
      <PageHeader title="Git 管理" button={addConfigBtn} />
      <div className={styles.content}>
        <GlobalConfig />
      </div>
    </div>
  );
}

export default Git;
