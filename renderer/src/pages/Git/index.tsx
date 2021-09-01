import PageContainer from '@/components/PageContainer';
import styles from './index.module.scss';
import GlobalGitConfig from './components/GlobalGitConfig';
import UserGitConfigList from './components/UserGitConfigList';

function Git() {
  return (
    <PageContainer title="Git 管理" >
      <div className={styles.content}>
        <GlobalGitConfig />
        <UserGitConfigList />
      </div>
    </PageContainer>
  );
}

export default Git;
