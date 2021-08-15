import { FC, useEffect } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Grid, Button, Message, Icon, Loading } from '@alifd/next';
import AppCard from '@/components/AppCard';
import store from '../../store';
import styles from './index.module.scss';
import { PackageInfo, ProcessStatus } from '@/interfaces/base';
import { IDEExtensionsInfo } from '@/interfaces/IDEExtension';
import BallonConfirm from '@/components/BalloonConfirm';

const { Row, Col } = Grid;

const ExtensionList: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('IDEExtension');
  const effectsState = store.useModelEffectsState('IDEExtension');

  const { extensionsInfo, installStatuses, uninstallStatuses } = state;

  const INSTALL_EXTENSION_CHANNEL = 'install-IDE-extension';
  const INSTALL_EXTENSION_STATUS_CHANNEL = 'install-IDE-extension-process-status';

  const UNINSTALL_EXTENSION_CHANNEL = 'uninstall-IDE-extension';
  const UNINSTALL_EXTENSION_PROCESS_STATUS_CHANNEL = 'uninstall-IDE-extension-process-status';

  useEffect(() => {
    dispatcher.getIDEExtensionsInfo();
  }, []);

  const installIDEExtension = (packageInfo: PackageInfo) => {
    ipcRenderer
      .invoke('install-IDE-extension', {
        packageInfo,
        installChannel: INSTALL_EXTENSION_CHANNEL,
        processChannel: INSTALL_EXTENSION_STATUS_CHANNEL,
      })
      .catch((error) => {
        Message.error(error.message);
      });
  };

  const uninstallIDEExtension = async (packageInfo) => {
    ipcRenderer
      .invoke('uninstall-IDE-extension', {
        packageInfo,
        uninstallChannel: UNINSTALL_EXTENSION_CHANNEL,
        processChannel: UNINSTALL_EXTENSION_PROCESS_STATUS_CHANNEL,
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
      uninstallStatus = uninstallStatuses[uninstallStatusIndex].status;
    }
    return (
      <>
        {versionStatus === 'uninstalled' ? (
          <Button text type="primary" className={styles.btn} onClick={() => installIDEExtension(packageInfo)}>
            {!installStatus ? '安装' : <Icon type="loading" />}
          </Button>
        ) : (
          <BallonConfirm
            onConfirm={async () => await uninstallIDEExtension(packageInfo)}
            title={`确定卸载 ${packageInfo.title}？`}
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
        dispatcher.getIDEExtensionsInfo();
        return;
      }
      if (status === 'error') {
        Message.error(errMsg);
        return;
      }

      dispatcher.updateInstallStatus(installStatus);
    }

    ipcRenderer.on(INSTALL_EXTENSION_STATUS_CHANNEL, handleUpdateInstallStatus);

    return () => {
      ipcRenderer.removeListener(
        INSTALL_EXTENSION_STATUS_CHANNEL,
        handleUpdateInstallStatus,
      );
    };
  }, []);

  useEffect(() => {
    function handleUpdateUninstallStatus(e: IpcRendererEvent, uninstallStatus: ProcessStatus) {
      const { status, errMsg } = uninstallStatus;
      if (status === 'finish' || status === 'error') {
        dispatcher.removeUninstallStatus(uninstallStatus);
        dispatcher.getIDEExtensionsInfo();
        return;
      }
      if (status === 'error') {
        Message.error(errMsg);
        return;
      }

      dispatcher.updateUninstallStatus(uninstallStatus);
    }

    ipcRenderer.on(UNINSTALL_EXTENSION_PROCESS_STATUS_CHANNEL, handleUpdateUninstallStatus);

    return () => {
      ipcRenderer.removeListener(
        UNINSTALL_EXTENSION_PROCESS_STATUS_CHANNEL,
        handleUpdateUninstallStatus,
      );
    };
  }, []);

  return (
    <Loading className={styles.extensionsList} visible={effectsState.getIDEExtensionsInfo.isLoading}>
      {
        extensionsInfo.map((extensionInfo: IDEExtensionsInfo) => (
          <div className={styles.extensionInfo} key={extensionInfo.category}>
            <div className={styles.title}>{extensionInfo.title}</div>
            <Row wrap gutter={8}>
              {
                extensionInfo.extensions.map((packageInfo: PackageInfo, index: number) => (
                  <Col s={12} l={8} key={packageInfo.name}>
                    <AppCard
                      {...packageInfo}
                      name={packageInfo.title}
                      operation={<Operation packageInfo={packageInfo} />}
                      showSplitLine={extensionInfo.extensions.length - (extensionInfo.extensions.length % 2 ? 1 : 2) > index}
                    />
                  </Col>
                ))
              }
            </Row>
          </div>
        ))
      }
    </Loading>
  );
};

export default ExtensionList;

