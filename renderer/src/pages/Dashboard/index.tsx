import { useEffect, useState } from 'react';
import { Button, Grid, Step, Message, Loading } from '@alifd/next';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import PageHeader from '@/components/PageHeader';
import XtermTerminal from '@/components/XtermTerminal';
import xtermManager from '@/utils/xtermManager';
import { IBasePackage } from '@/interfaces';
import { STEP_STATUS_ICON } from '@/constants';
import AppCard from './components/AppCard';
import InstallConfirmDialog from './components/InstallConfirmDialog';
import InstallResult from './components/InstallResult';
import styles from './index.module.scss';
import store from './store';

const { Row, Col } = Grid;

const Dashboard = () => {
  const [visible, setVisible] = useState(false);

  const [state, dispatchers] = store.useModel('dashboard');
  const effectsState = store.useModelEffectsState('dashboard');
  const {
    basePackagesList,
    isInstalling,
    installPackagesList,
    pkgInstallStatuses,
    pkgInstallStep,
    currentStep,
  } = state;

  const TERM_ID = 'dashboard';
  const INSTALL_PACKAGE_CHANNEL = 'install-base-package';
  const INSTALL_PROCESS_STATUS_CHANNEL = 'install-base-package-process-status';

  const writeChunk = (
    e: IpcRendererEvent,
    data: { chunk: string; ln?: boolean },
  ) => {
    const { chunk, ln } = data;
    const xterm = xtermManager.getTerm(TERM_ID);
    xterm.writeChunk(chunk, ln);
  };

  function onDialogConfirm(packageNames: string[]) {
    onDialogClose();
    if (!packageNames.length) {
      return;
    }
    const selectedInstallPackagesList = installPackagesList.filter((item) => {
      return packageNames.includes(item.name);
    });

    dispatchers.updateInstallStatus(true);
    dispatchers.initStep(selectedInstallPackagesList);
    ipcRenderer
      .invoke('install-base-packages', {
        packagesList: selectedInstallPackagesList,
        installChannel: INSTALL_PACKAGE_CHANNEL,
        processChannel: INSTALL_PROCESS_STATUS_CHANNEL,
      })
      .catch((error) => {
        Message.error(error.message);
      });
  }

  function onDialogOpen() { setVisible(true); }

  function onDialogClose() { setVisible(false); }

  function goBack() {
    dispatchers.updateInstallStatus(false);
    dispatchers.getBasePackages();
  }

  async function handleCancelInstall() {
    await ipcRenderer.invoke(
      'cancel-install-base-packages',
      INSTALL_PACKAGE_CHANNEL,
    );
    goBack();
  }

  useEffect(() => {
    dispatchers.getBasePackages();
  }, []);

  useEffect(() => {
    ipcRenderer.on(INSTALL_PACKAGE_CHANNEL, writeChunk);
    return () => {
      ipcRenderer.removeListener(INSTALL_PACKAGE_CHANNEL, writeChunk);
    };
  }, []);

  useEffect(() => {
    function handleUpdateInstallStatus(e: IpcRendererEvent, { currentIndex, status, errMsg }) {
      const { dashboard } = store.getState();
      if (status === 'done') {
        dispatchers.updateCurrentStep(dashboard.currentStep + 1);
        return;
      }
      dispatchers.updatePkgInstallStep(currentIndex);
      dispatchers.updatePkgInstallStepStatus({ step: currentIndex, status });
    }

    ipcRenderer.on(INSTALL_PROCESS_STATUS_CHANNEL, handleUpdateInstallStatus);
    return () => {
      ipcRenderer.removeListener(
        INSTALL_PROCESS_STATUS_CHANNEL,
        handleUpdateInstallStatus,
      );
    };
  }, []);

  const cancelInstallBtn = currentStep === 2 ? null : (
    <Button type="normal" onClick={handleCancelInstall}>
      取消安装
    </Button>
  );

  const installButton = isInstalling ? cancelInstallBtn : (
    <Button type="primary" onClick={onDialogOpen}>
      一键安装
    </Button>
  );

  return (
    <Loading className={styles.dashboard} visible={effectsState.getBasePackages.isLoading}>
      <PageHeader
        title="前端开发必备"
        button={installPackagesList.length ? installButton : null}
      />
      <main>
        {isInstalling ? (
          <div className={styles.install}>
            <Row wrap>
              <Col span={6}>
                <Step current={currentStep} direction="ver">
                  <Step.Item title="开始" />
                  <Step.Item
                    title="安装"
                    content={
                      <div className={styles.itemStep}>
                        <Step current={pkgInstallStep} direction="ver" shape="dot">
                          {installPackagesList.map((item: IBasePackage, index: number) => (
                            <Step.Item
                              key={item.name}
                              title={item.title}
                              icon={STEP_STATUS_ICON[pkgInstallStatuses[index].status]}
                            />
                          ))}
                        </Step>
                      </div>
              }
                  />
                  <Step.Item title="完成" />
                </Step>
              </Col>
              <Col span={18}>
                {(currentStep === 2) ? (
                  <InstallResult
                    goBack={goBack}
                  />
                ) : (
                  <XtermTerminal id={TERM_ID} name={TERM_ID} options={{ cols: 68, rows: 30 }} />
                )}
              </Col>
            </Row>
          </div>
        ) : (
          <Row wrap>
            {basePackagesList.map((item: IBasePackage, index: number) => (
              <Col s={12} l={8} key={item.name}>
                <AppCard
                  name={item.title}
                  description={item.description}
                  icon={item.icon}
                  versionStatus={item.versionStatus}
                  recommended={item.recommended}
                  showSplitLine={basePackagesList.length - (basePackagesList.length % 2 ? 1 : 2) > index}
                  wanringMessage={item.warningMessage}
                />
              </Col>
            ))}
          </Row>
        )}
      </main>
      {visible && (
        <InstallConfirmDialog
          packages={installPackagesList}
          onCancel={onDialogClose}
          onOk={onDialogConfirm}
        />
      )}
    </Loading>
  );
};

export default Dashboard;
