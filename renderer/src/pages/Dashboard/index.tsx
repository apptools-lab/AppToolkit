import { useEffect } from 'react';
import { Button, Grid } from '@alifd/next';
import AppCard from './components/AppCard';
import styles from './index.module.scss';
import store from './store';
import { IBasePackage } from '@/interfaces/dashboard';
import { ipcRenderer } from 'electron';

const { Row, Col } = Grid;

const Dashboard = () => {
  const [state, dispatchers] = store.useModel('dashboard');
  useEffect(() => {
    const init = async function () {
      await dispatchers.getBasePackages();
    };
    init();
  }, []);

  async function handleInstall() {
    dispatchers.updateInstallStatus(true);

    const packagesList = state.basePackageData.filter((basePackage: IBasePackage) => {
      return basePackage.installStatus !== 'installed';
    });
    // packagesList.forEach(async (packageInfo: IBasePackage) => {
    //   console.log('start');
    //   await ipcRenderer.invoke('installPackage', packageInfo);
    //   console.log('finished');
    // });

    for (const packageInfo of packagesList) {
      console.log('start');
      await ipcRenderer.invoke('installPackage', packageInfo);
      console.log('finished');
    }
  }

  function handleCancel() {
    dispatchers.updateInstallStatus(false);
  }

  console.log('state.basePackageData:', state.basePackageData);
  return (
    <div className={styles.dashboard}>
      <div className={styles.head}>
        <h1>前端开发必备</h1>
        {state.isInstalling ?
          <Button type="normal" onClick={handleCancel}>取消安装</Button> :
          <Button type="primary" onClick={handleInstall}>一键安装</Button>}
      </div>
      <main>
        <Row wrap>
          {
            state.basePackageData.map((item: IBasePackage) => (
              <Col span="12" key={item.name}>
                <AppCard
                  name={item.title}
                  description={item.description}
                  icon={item.icon}
                  installStatus={item.installStatus}
                />
              </Col>
            ))
          }
        </Row>

      </main>
    </div>
  );
};

export default Dashboard;
