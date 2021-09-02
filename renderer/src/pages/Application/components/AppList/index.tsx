import { FC, useEffect } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Button, Message, Icon, Loading, List, Tag } from '@alifd/next';
import store from '../../store';
import styles from './index.module.scss';
import { PackageInfo, ProcessStatus } from '@/interfaces/base';
import { AppInfo } from '@/interfaces/application';
import BalloonConfirm, { BalloonAlign } from '@/components/BalloonConfirm';
import AppDetail from '@/components/AppDetail';
import PageContainer from '@/components/PageContainer';

const INSTALL_APP_CHANNEL = 'install-app';
const INSTALL_APP_PROCESS_STATUS_CHANNEL = 'install-app-process-status';

const UNINSTALL_APP_CHANNEL = 'uninstall-app';
const UNINSTALL_APP_PROCESS_STATUS_CHANNEL = 'uninstall-app-process-status';

const presetColors = ['blue', 'green', 'orange', 'red', 'turquoise', 'yellow'];

const AppList: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('application');
  const effectsState = store.useModelEffectsState('application');
  const { appsInfo, installStatuses, uninstallStatuses, detailVisible, currentAppInfo } = state;

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

  const uninstallApp = async (appInfo: PackageInfo) => {
    ipcRenderer
      .invoke('uninstall-app', {
        packageInfo: appInfo,
        uninstallChannel: UNINSTALL_APP_CHANNEL,
        processChannel: UNINSTALL_APP_PROCESS_STATUS_CHANNEL,
      })
      .catch((error) => {
        Message.error(error.message);
      });
  };

  const Operation = ({
    packageInfo,
    balloonAlign,
  }: {
    packageInfo: PackageInfo;
    balloonAlign?: BalloonAlign;
  }) => {
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

    const btnStyle = {
      fontSize: 12,
      fontWeight: 700,
      backgroundColor: '#f2f2f7',
      width: 64,
      height: 24,
      borderRadius: 10,
    };
    return (
      <div>
        {versionStatus === 'uninstalled' ? (
          <Button text type="primary" style={btnStyle} onClick={() => installApp(packageInfo)}>
            {!installStatus ? '安装' : <Icon type="loading" />}
          </Button>
        ) : (
          <BalloonConfirm
            onConfirm={async () => await uninstallApp(packageInfo)}
            title={`确定卸载 ${packageInfo.title}？`}
            align={balloonAlign || 'bl'}
          >
            <Button text type="primary" style={btnStyle} className={styles.btn}>
              {!uninstallStatus ? '卸载' : <Icon type="loading" />}
            </Button>
          </BalloonConfirm>
        )}
      </div>
    );
  };

  const showDetailPage = (appInfo: PackageInfo) => {
    dispatcher.setDetailVisible(true);
    dispatcher.setCurrentAppInfo(appInfo);
  };

  const goBack = () => {
    dispatcher.setDetailVisible(false);
    dispatcher.setCurrentAppInfo({} as any);
  };

  useEffect(() => {
    function handleUpdateInstallStatus(e: IpcRendererEvent, installStatus: ProcessStatus) {
      const { status, errMsg } = installStatus;
      if (status === 'finish' || status === 'error') {
        dispatcher.removeInstallStatus(installStatus);
        dispatcher.getAppsInfo();
        const currentState = store.getState();
        dispatcher.setCurrentAppInfo({ ...currentState.application.currentAppInfo, versionStatus: 'installed' } as any);
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
        const currentState = store.getState();
        dispatcher.setCurrentAppInfo({ ...currentState.application.currentAppInfo, versionStatus: 'uninstalled' } as any);
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
    <>
      {
        !detailVisible ? (
          <PageContainer title="桌面客户端">
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
                            <div onClick={() => showDetailPage(item)} className={styles.subTitle}>
                              {item.title}
                            </div>
                            <Tag size="small" className={styles.tag} type="normal" color={presetColors[index % presetColors.length]}>
                              {appInfo.title}
                            </Tag>
                          </div>
                        }
                        media={<img src={item.icon} alt="appIcon" className={styles.icon} onClick={() => showDetailPage(item)} />}
                      >
                        <p className={styles.description}>{item.description}</p>
                      </List.Item>
                    )}
                  />
                </div>
              ))
            }
            </Loading>
          </PageContainer>
        ) : (
          <AppDetail
            {...currentAppInfo as any}
            goBack={goBack}
            operation={<Operation packageInfo={currentAppInfo as any} balloonAlign="br" />}
          />
        )
      }
    </>
  );
};

export default AppList;
