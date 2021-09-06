import styles from './index.module.scss';
import { Button } from '@alifd/next';

const Updater = () => {
  return (
    <div className={styles.updaterContainer}>
      <div>已为你下载到最新版的 AppToolkit，是否立即升级?</div>
      <div>
        <Button>马上升级</Button>
      </div>
    </div>
  );
};

export default Updater;
