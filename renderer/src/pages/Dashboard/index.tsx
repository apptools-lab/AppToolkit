import { useEffect } from 'react';
import { Button, Grid } from '@alifd/next';
import { ipcRenderer } from 'electron';
import PageHeader from '@/components/PageHeader';
import AppCard from './components/AppCard';
import styles from './index.module.scss';
import store from './store';
import { IBasePackage } from '@/interfaces/dashboard';

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

    const packagesList = state.basePackagesData.filter((basePackage: IBasePackage) => {
      return basePackage.versionStatus !== 'installed';
    });
    for (const packageInfo of packagesList) {
      await ipcRenderer.invoke('installPackage', packageInfo);
    }
  }

  function handleCancel() {
    dispatchers.updateInstallStatus(false);
  }

  console.log('state.basePackagesData:', state.basePackagesData);
  return (
    <div className={styles.dashboard}>
      <PageHeader
        title="前端开发必备"
        button={state.isInstalling ?
          <Button type="normal" onClick={handleCancel}>取消安装</Button> :
          <Button type="primary" onClick={handleInstall}>一键安装</Button>}
      />
      <main>
        <Row wrap>
          {
            state.basePackagesData.map((item: IBasePackage) => (
              <Col s={12} l={8} key={item.name}>
                <AppCard
                  name={item.title}
                  description={item.description}
                  icon={item.icon}
                  versionStatus={item.versionStatus}
                  recommended={item.recommended}
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
