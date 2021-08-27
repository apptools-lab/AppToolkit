import { FC, useEffect } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Button, Message, Icon, Loading, List, Tag } from '@alifd/next';
import store from '../../store';
import styles from './index.module.scss';
import { PackageInfo, ProcessStatus } from '@/interfaces/base';
import { AppInfo } from '@/interfaces/application';
import BallonConfirm from '@/components/BalloonConfirm';

const INSTALL_APP_CHANNEL = 'install-app';
const INSTALL_APP_PROCESS_STATUS_CHANNEL = 'install-app-process-status';

const UNINSTALL_APP_CHANNEL = 'uninstall-app';
const UNINSTALL_APP_PROCESS_STATUS_CHANNEL = 'uninstall-app-process-status';

const presetColors = ['blue', 'green', 'orange', 'red', 'turquoise', 'yellow'];

const AppList: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('application');
  const effectsState = store.useModelEffectsState('application');
  const { appsInfo, installStatuses, uninstallStatuses } = state;

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

  const Operation = ({ packageInfo }: { packageInfo: PackageInfo }) => {
    const { versionStatus } = packageInfo;
    let installStatus;
    let uninstallStatus;

    const installStatusIndex = installStatuses.findIndex(({ id }) => id === packageInfo.id);
    if (installStatusIndex > -1) {
      installStatus = installStatuses[installStatusIndex].status;
    }

    const uninstallStatusIndex = uninstallStatuses.findIndex(({ id }) => id === packageInfo.id);
    if (uninstallStatusIndex > -1) {
      uninstallStatus = uninstallStatuses[uninstallStatusIndex].status;
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
            title={`确定卸载 ${packageInfo.title}？`}
            align="bl"
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
        dispatcher.removeUninstallStatus(uninstallStatus);
        dispatcher.getAppsInfo();
        return;
      }
      if (status === 'error') {
        Message.error(errMsg);
        return;
      }

      dispatcher.updateUninstallStatus(uninstallStatus);
    }

    ipcRenderer.on(UNINSTALL_APP_PROCESS_STATUS_CHANNEL, handleUpdateUninstallStatus);

    return () => {
      ipcRenderer.removeListener(
        UNINSTALL_APP_PROCESS_STATUS_CHANNEL,
        handleUpdateUninstallStatus,
      );
    };
  }, []);

  useEffect(() => {
    if (effectsState.getAppsInfo.error) {
      Message.error(effectsState.getAppsInfo.error.message);
    }
  }, [effectsState.getAppsInfo.error]);
  return (
    <Loading className={styles.appList} visible={effectsState.getAppsInfo.isLoading}>
      {
        appsInfo.map((appInfo: AppInfo, index: number) => (
          <div className={styles.appInfo} key={appInfo.id}>
            <List
              dataSource={appInfo.packages || []}
              renderItem={(item: PackageInfo, i: number) => (
                <List.Item
                  key={i}
                  extra={<Operation packageInfo={item} />}
                  title={
                    <div className={styles.title}>
                      <a href={item.link} target="__blank" className={styles.subTitle}>{item.title}</a>
                      <Tag size="small" className={styles.tag} type="normal" color={presetColors[index % presetColors.length]}>{appInfo.title}</Tag>
                    </div>
                }
                  media={<img src={item.icon} alt="appIcon" className={styles.icon} />}
                >
                  <p className={styles.description}>{item.description}</p>
                </List.Item>
              )}
            />
          </div>
        ))
      }
    </Loading>
  );
};

export default AppList;
