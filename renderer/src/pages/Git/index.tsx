import PageHeader from '@/components/PageHeader';
import styles from './index.module.scss';
import GlobalGitConfig from './components/GlobalGitConfig';
import UserGitConfigList from './components/UserGitConfigList';

function Git() {
  return (
    <div className={styles.container}>
      <PageHeader title="Git 管理" />
      <div className={styles.content}>
        <GlobalGitConfig />
        <UserGitConfigList />
      </div>
    </div>
  );
}

export default Git;
