import { FC, useEffect } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Grid, Button, Message, Icon } from '@alifd/next';
import AppCard from '@/components/AppCard';
import store from '../../store';
import styles from './index.module.scss';
import { PackageInfo } from '@/interfaces/base';
import { AppInfo, ProcessStatus } from '@/interfaces/application';
import BallonConfirm from '@/components/BalloonConfirm';

const { Row, Col } = Grid;

const AppList: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('application');
  const { appsInfo, installStatuses, uninstallStatuses } = state;

  const INSTALL_APP_CHANNEL = 'install-app';
  const INSTALL_APP_PROCESS_STATUS_CHANNEL = 'install-app-process-status';

  const UNINSTALL_APP_CHANNEL = 'uninstall-app';
  const UNINSTALL_APP_PROCESS_STATUS_CHANNEL = 'uninstall-app-process-status';

  useEffect(() => {
    dispatcher.getAppsInfo();
  }, []);

  const installApp = (packageInfo: PackageInfo) => {
    ipcRenderer
      .invoke('install-app', {
        packageInfo,
        installChannel: INSTALL_APP_CHANNEL,
        processChannel: INSTALL_APP_PROCESS_STATUS_CHANNEL,
      })
      .catch((error) => {
        Message.error(error.message);
      });
  };

  const uninstallApp = async (packageInfo) => {
    ipcRenderer
      .invoke('uninstall-app', {
        packageInfo,
        uninstallChannel: UNINSTALL_APP_CHANNEL,
        processChannel: UNINSTALL_APP_PROCESS_STATUS_CHANNEL,
      })
      .catch((error) => {
        Message.error(error.message);
      });
  };

  const Operation = ({ packageInfo }) => {
    const { versionStatus } = packageInfo;
    let installStatus;
    let uninstallStatus;

    const installStatusIndex = installStatuses.findIndex(({ name }) => name === packageInfo.name);
    if (installStatusIndex > -1) {
      installStatus = installStatuses[installStatusIndex].status;
    }

    const uninstallStatusIndex = uninstallStatuses.findIndex(({ name }) => name === packageInfo.name);
    if (uninstallStatusIndex > -1) {
      uninstallStatus = installStatuses[uninstallStatusIndex].status;
    }
    return (
      <>
        {versionStatus === 'uninstalled' ? (
          <Button text type="primary" className={styles.btn} onClick={() => installApp(packageInfo)}>
            {!installStatus ? '安装' : <Icon type="loading" />}
          </Button>
        ) : (
          <BallonConfirm
            onConfirm={async () => await uninstallApp(packageInfo)}
            title="确定卸载？"
            // disable={isReinstallCurrentDep}
          >
            <Button text type="primary" className={styles.btn}>
              {!uninstallStatus ? '卸载' : <Icon type="loading" />}
            </Button>
          </BallonConfirm>
        )}
      </>
    );
  };

  useEffect(() => {
    function handleUpdateInstallStatus(e: IpcRendererEvent, installStatus: ProcessStatus) {
      const { status, errMsg } = installStatus;
      if (status === 'finish' || status === 'error') {
        dispatcher.removeInstallStatus(installStatus);
        dispatcher.getAppsInfo();
        return;
      }
      if (status === 'error') {
        Message.error(errMsg);
        return;
      }

      dispatcher.updateInstallStatus(installStatus);
    }

    ipcRenderer.on(INSTALL_APP_PROCESS_STATUS_CHANNEL, handleUpdateInstallStatus);

    return () => {
      ipcRenderer.removeListener(
        INSTALL_APP_PROCESS_STATUS_CHANNEL,
        handleUpdateInstallStatus,
      );
    };
  }, []);
  useEffect(() => {
    function handleUpdateUninstallStatus(e: IpcRendererEvent, uninstallStatus: ProcessStatus) {
      const { status, errMsg } = uninstallStatus;
      if (status === 'finish' || status === 'error') {
        dispatcher.removeInstallStatus(uninstallStatus);
        dispatcher.getAppsInfo();
        return;
      }
      if (status === 'error') {
        Message.error(errMsg);
        return;
      }

      dispatcher.updateInstallStatus(uninstallStatus);
    }

    ipcRenderer.on(UNINSTALL_APP_PROCESS_STATUS_CHANNEL, handleUpdateUninstallStatus);

    return () => {
      ipcRenderer.removeListener(
        UNINSTALL_APP_PROCESS_STATUS_CHANNEL,
        handleUpdateUninstallStatus,
      );
    };
  }, []);

  return (
    <div className={styles.appList}>
      {
        appsInfo.map((appInfo: AppInfo) => (
          <div className={styles.appInfo} key={appInfo.category}>
            <div className={styles.title}>{appInfo.title}</div>
            <Row wrap gutter={8}>
              {
                appInfo.packages.map((packageInfo: PackageInfo, index: number) => (
                  <Col s={12} l={8} key={packageInfo.name}>
                    <AppCard
                      {...packageInfo}
                      operation={<Operation packageInfo={packageInfo} />}
                      showSplitLine={appInfo.packages.length - (appInfo.packages.length % 2 ? 1 : 2) > index}
                    />
                  </Col>
                ))
              }
            </Row>
          </div>
        ))
      }
    </div>
  );
};

export default AppList;
