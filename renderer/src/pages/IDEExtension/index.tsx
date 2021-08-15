import PageHeader from '@/components/PageHeader';
import ExtensionList from './components/ExtensionList';
import styles from './index.module.scss';

function IDEExtension() {
  return (
    <div className={styles.container}>
      <PageHeader title="编辑器插件" />
      <ExtensionList />
    </div>
  );
}

export default IDEExtension;
