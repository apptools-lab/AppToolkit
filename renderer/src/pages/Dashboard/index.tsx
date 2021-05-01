import { useEffect, useState } from 'react';
import { Button, Grid, Step, Message } from '@alifd/next';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import PageHeader from '@/components/PageHeader';
import XtermTerminal from '@/components/XtermTerminal';
import xtermManager from '@/utils/xtermManager';
import { IBasePackage } from '@/interfaces';
import AppCard from './components/AppCard';
import InstallConfirmDialog from './components/InstallConfirmDialog';
import InstallResult from './components/InstallResult';
import styles from './index.module.scss';
import store from './store';

const { Row, Col } = Grid;

const Dashboard = () => {
  const [visible, setVisible] = useState(false);

  const [state, dispatchers] = store.useModel('dashboard');
  const {
    basePackagesList,
    isInstalling,
    installPackagesList,
    stepsStatus,
    currentStep,
    installErrMsg,
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
    dispatchers.initStepStatus(selectedInstallPackagesList.length);
    ipcRenderer
      .invoke('install-base-package', {
        packagesList: selectedInstallPackagesList,
        installChannel: INSTALL_PACKAGE_CHANNEL,
        processChannel: INSTALL_PROCESS_STATUS_CHANNEL,
      })
      .catch((error) => {
        Message.error(error.message);
      });
  }

  function onDialogOpen() {
    setVisible(true);
  }

  function onDialogClose() {
    setVisible(false);
  }

  function goBack() {
    dispatchers.updateInstallStatus(false);
    dispatchers.getBasePackages();
  }

  async function handleCancelInstall() {
    await ipcRenderer.invoke(
      'cancel-install-base-package',
      INSTALL_PACKAGE_CHANNEL,
    );
    goBack();
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
      const { dashboard } = store.getState();
      let nextStep;
      if (typeof currentIndex !== 'number') {
        nextStep = dashboard.currentStep + 1;
      } else {
        nextStep = currentIndex + 1;
      }
      if (status === 'success' || status === 'fail') {
        if (errMsg) {
          dispatchers.setInstallErrMsg(JSON.parse(errMsg));
        }
      }
      dispatchers.updateCurrentStep(nextStep);
      dispatchers.updateStepStatus({ currentStep: nextStep, status });
    }

    ipcRenderer.on(INSTALL_PROCESS_STATUS_CHANNEL, handleUpdateInstallStatus);
    return () => {
      ipcRenderer.removeListener(
        INSTALL_PROCESS_STATUS_CHANNEL,
        handleUpdateInstallStatus,
      );
    };
  }, []);

  const cancelInstallBtn = stepsStatus.length - 1 === currentStep ? null : (
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
    <div className={styles.dashboard}>
      <PageHeader
        title="前端开发必备"
        button={installPackagesList.length ? installButton : null}
      />
      <main>
        {isInstalling ? (
          <>
            <Step current={currentStep}>
              <Step.Item title="开始" />
              {installPackagesList.map((item: IBasePackage) => (
                <Step.Item
                  key={item.name}
                  title={item.title}
                />
              ))}
              <Step.Item title="完成" />
            </Step>
            <div className={styles.content}>
              {(stepsStatus.length - 1 === currentStep) ? (
                <InstallResult
                  status={stepsStatus[stepsStatus.length - 1]}
                  installErrMsg={installErrMsg}
                  goBack={goBack}
                />
              ) : (
                <XtermTerminal id={TERM_ID} name={TERM_ID} />
              )}
            </div>
          </>
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
                  showSplitLine={
                    basePackagesList.length -
                      (basePackagesList.length % 2 ? 1 : 2) >
                    index
                  }
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
    </div>
  );
};

export default Dashboard;
