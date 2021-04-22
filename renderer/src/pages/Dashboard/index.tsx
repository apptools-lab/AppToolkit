import { useEffect } from 'react';
import { Button, Grid, Step, Icon } from '@alifd/next';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import PageHeader from '@/components/PageHeader';
import XtermTerminal from '@/components/XtermTerminal';
import xtermManager from '@/utils/xtermManager';
import AppCard from './components/AppCard';
import styles from './index.module.scss';
import store from './store';
import { IBasePackage } from '@/interfaces/dashboard';

const { Row, Col } = Grid;

const StepItemRender = (index: number, status: string) => {
  const iconType = {
    finish: 'success',
    process: 'loading',
    error: 'error',
  };
  return (
    <div className={styles.customNode}>
      {Object.keys(iconType).includes(status) ? <Icon type={iconType[status]} /> : <span>{index + 1}</span>}
    </div>
  );
};

const Dashboard = () => {
  const [state, dispatchers] = store.useModel('dashboard');
  const { basePackagesList, isInstalling, installPackagesList, stepsStatus, currentStep } = state;

  const TERM_ID = 'dashboard';
  const INSTALL_PACKAGE_CHANNEL = 'install-base-package';
  const INSTALL_PROCESS_STATUS_CHANNEL = 'install-base-package-process-status';

  const writeChunk = (e: IpcRendererEvent, data: { chunk: string; ln?: boolean }) => {
    const { chunk, ln } = data;
    const xterm = xtermManager.getTerm(TERM_ID);
    xterm.writeChunk(chunk, ln);
  };

  async function handleInstall() {
    dispatchers.updateInstallStatus(true);
    dispatchers.initStepStatus(installPackagesList.length);
    await ipcRenderer.invoke(
      'install-base-package',
      {
        packagesList: installPackagesList,
        installChannel: INSTALL_PACKAGE_CHANNEL,
        processChannel: INSTALL_PROCESS_STATUS_CHANNEL,
      },
    );
  }

  async function handleCancelInstall() {
    dispatchers.updateInstallStatus(false);
    await ipcRenderer.invoke('cancel-install-base-package', INSTALL_PACKAGE_CHANNEL);
    dispatchers.getBasePackages();
  }

  useEffect(() => {
    const init = async function () {
      await dispatchers.getBasePackages();
    };
    init();
  }, []);

  useEffect(() => {
    ipcRenderer.on(INSTALL_PACKAGE_CHANNEL, writeChunk);
    return () => {
      ipcRenderer.removeListener(INSTALL_PACKAGE_CHANNEL, writeChunk);
    };
  }, []);

  useEffect(() => {
    function handleUpdateInstallStatus(e: IpcRendererEvent, { currentIndex, status, errMsg }) {
      if (status === 'success') {
        dispatchers.updateInstallStatus(false);
        dispatchers.getBasePackages();
      } else {
        dispatchers.updateCurrentStep({ currentIndex, status });
      }
      if (errMsg) {
        // TODO show error
      }
    }

    ipcRenderer.on(INSTALL_PROCESS_STATUS_CHANNEL, handleUpdateInstallStatus);
    return () => {
      ipcRenderer.removeListener(INSTALL_PROCESS_STATUS_CHANNEL, handleUpdateInstallStatus);
    };
  }, []);

  const installButton = isInstalling ?
    <Button type="normal" onClick={handleCancelInstall}>取消安装</Button> :
    <Button type="primary" onClick={handleInstall}>一键安装</Button>;

  return (
    <div className={styles.dashboard}>
      <PageHeader
        title="前端开发必备"
        button={installPackagesList.length ? installButton : null}
      />
      <main>
        {isInstalling ? (
          <div>
            {/* TODO 考虑只安装一个 package 的时候进度的展示，目前只有一个 StepItem */}
            <Step current={currentStep} itemRender={StepItemRender}>
              {
                installPackagesList.map((item: IBasePackage, index: number) => (
                  <Step.Item key={item.name} title={item.title} status={stepsStatus[index]} />
                ))
              }
            </Step>
            <div className={styles.term}>
              <XtermTerminal id={TERM_ID} name={TERM_ID} />
            </div>
          </div>) : (
            <Row wrap>
              {
              basePackagesList.map((item: IBasePackage, index: number) => (
                <Col s={12} l={8} key={item.name}>
                  <AppCard
                    name={item.title}
                    description={item.description}
                    icon={item.icon}
                    versionStatus={item.versionStatus}
                    recommended={item.recommended}
                    showSplitLine={basePackagesList.length - (basePackagesList.length % 2 ? 1 : 2) > index}
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
