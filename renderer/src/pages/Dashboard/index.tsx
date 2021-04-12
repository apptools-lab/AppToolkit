import { useEffect } from 'react';
import { Button } from '@alifd/next';
import AppCard from './components/AppCard';
import styles from './index.module.scss';
import store from './store';

const Dashboard = () => {
  const [state, dispatchers] = store.useModel('dashboard');
  useEffect(() => {
    const init = async function () {
      await dispatchers.getBaseApp();
    };
    init();
  }, []);
  console.log(state);
  return (
    <div className={styles.dashboard}>
      <div className={styles.head}>
        <h1>前端开发必备</h1>
        <Button type="primary">一键安装</Button>
      </div>
      <main>
        {/* <AppCard /> */}
      </main>
    </div>
  );
};

export default Dashboard;
