import { useEffect, useState } from 'react';
import { Button, Grid, Step, Icon, Message } from '@alifd/next';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import PageHeader from '@/components/PageHeader';
import XtermTerminal from '@/components/XtermTerminal';
import xtermManager from '@/utils/xtermManager';
import { IBasePackage } from '@/interfaces/dashboard';
import classNames from 'classnames';
import AppCard from './components/AppCard';
import InstallConfirmDialog from './components/InstallConfirmDialog';
import styles from './index.module.scss';
import store from './store';

const { Row, Col } = Grid;

const StepItemRender = (index: number, status: string) => {
  const iconType = {
    finish: 'success',
    process: 'loading',
    error: 'error',
  };

  const isWaitStatus = Object.keys(iconType).includes(status);
  return (
    <div
      className={classNames(styles.customNode, {
        [styles.activeNode]: !isWaitStatus,
      })}
    >
      {isWaitStatus ? (
        <Icon type={iconType[status]} />
      ) : (
        <span>{index + 1}</span>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [visible, setVisible] = useState(false);

  const [state, dispatchers] = store.useModel('dashboard');
  const {
    basePackagesList,
    isInstalling,
    installPackagesList,
    stepsStatus,
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

  async function handleCancelInstall() {
    dispatchers.updateInstallStatus(false);
    await ipcRenderer.invoke(
      'cancel-install-base-package',
      INSTALL_PACKAGE_CHANNEL,
    );
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
      } else if (status === 'fail') {
        // TODO: show all the error message
      } else {
        dispatchers.updateCurrentStep({
          currentIndex: currentIndex + 1,
          status,
        });
        if (errMsg) {
          Message.error(errMsg);
        }
      }
    }

    ipcRenderer.on(INSTALL_PROCESS_STATUS_CHANNEL, handleUpdateInstallStatus);
    return () => {
      ipcRenderer.removeListener(
        INSTALL_PROCESS_STATUS_CHANNEL,
        handleUpdateInstallStatus,
      );
    };
  }, []);

  const installButton = isInstalling ? (
    <Button type="normal" onClick={handleCancelInstall}>
      取消安装
    </Button>
  ) : (
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
          <div>
            <Step current={currentStep} itemRender={StepItemRender}>
              <Step.Item title="开始" />
              {installPackagesList.map((item: IBasePackage, index: number) => (
                <Step.Item
                  key={item.name}
                  title={item.title}
                  status={
                    stepsStatus[index + 1] === 'error'
                      ? 'finish'
                      : stepsStatus[index + 1]
                  }
                />
              ))}
            </Step>
            <div className={styles.term}>
              <XtermTerminal id={TERM_ID} name={TERM_ID} />
            </div>
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
