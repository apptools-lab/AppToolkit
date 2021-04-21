import { useEffect } from 'react';
import { Button, Grid, Step } from '@alifd/next';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import PageHeader from '@/components/PageHeader';
import XtermTerminal from '@/components/XtermTerminal';
import xtermManager from '@/utils/xtermManager';
import AppCard from './components/AppCard';
import styles from './index.module.scss';
import store from './store';
import { IBasePackage } from '@/interfaces/dashboard';

const { Row, Col } = Grid;

const Dashboard = () => {
  const [state, dispatchers] = store.useModel('dashboard');
  const { basePackagesData, isInstalling } = state;
  const TERM_ID = 'dashboard';
  const INSTALL_PACKAGE_CHANNEL_NAME = 'install-base-package';

  const writeChunk = (e: IpcRendererEvent, data: string) => {
    const xterm = xtermManager.getTerm(TERM_ID);
    xterm.writeChunk(data);
  };

  async function handleInstall() {
    dispatchers.updateInstallStatus(true);
    const packagesList = basePackagesData.filter((basePackage: IBasePackage) => {
      return basePackage.versionStatus !== 'installed';
    });
    for (const packageInfo of packagesList) {
      await ipcRenderer.invoke('install-package', packageInfo, INSTALL_PACKAGE_CHANNEL_NAME);
    }

    dispatchers.updateInstallStatus(false);
    await dispatchers.getBasePackages();
  }

  function handleCancelInstall() {
    dispatchers.updateInstallStatus(false);
  }

  useEffect(() => {
    const init = async function () {
      await dispatchers.getBasePackages();
    };
    init();
  }, []);

  useEffect(() => {
    ipcRenderer.on(INSTALL_PACKAGE_CHANNEL_NAME, writeChunk);
    return () => {
      ipcRenderer.removeListener(INSTALL_PACKAGE_CHANNEL_NAME, writeChunk);
    };
  }, []);

  return (
    <div className={styles.dashboard}>
      <PageHeader
        title="前端开发必备"
        button={isInstalling ?
          <Button type="normal" onClick={handleCancelInstall}>取消安装</Button> :
          <Button type="primary" onClick={handleInstall}>一键安装</Button>}
      />
      <main>
        {isInstalling ? (
          <div>
            <Step />
            <XtermTerminal id={TERM_ID} name={TERM_ID} />
          </div>) : (
            <Row wrap>
              {
              basePackagesData.map((item: IBasePackage, index: number) => (
                <Col s={12} l={8} key={item.name}>
                  <AppCard
                    name={item.title}
                    description={item.description}
                    icon={item.icon}
                    versionStatus={item.versionStatus}
                    recommended={item.recommended}
                    showSplitLine={basePackagesData.length - 2 > index}
                  />
                </Col>
              ))
              }
            </Row>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
