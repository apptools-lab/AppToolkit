import { FC, useEffect } from 'react';
import { ipcRenderer, IpcRendererEvent, shell } from 'electron';
import { Grid, Button, Message, Icon, Loading, Dialog } from '@alifd/next';
import AppCard from '@/components/AppCard';
import CustomIcon from '@/components/Icon';
import store from '@/pages/Main/store';
import styles from './index.module.scss';
import { PackageInfo, ProcessStatus } from '@/types/base';
import { BrowserExtensionsInfo } from '@/types/browserExtension';
import BrowserNotInstalled from '../BrowserNotInstalled';
import PageHeader from '@/components/PageHeader';
import AppDetail from '@/components/AppDetail';

const { Row, Col } = Grid;

const INSTALL_EXTENSION_CHANNEL = 'install-browser-extension';
const INSTALL_EXTENSION_STATUS_CHANNEL = 'install-browser-extension-process-status';
const REMOVE_STATE_STATUSES = ['finish', 'error'];

const installBtnStyle = {
  fontSize: 12,
  fontWeight: 700,
  backgroundColor: '#f2f2f7',
  width: 64,
  height: 24,
  borderRadius: 10,
};

const ExtensionList: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('browserExtension');
  const effectsState = store.useModelEffectsState('browserExtension');

  const { extensionsInfo, installStatuses, detailVisible, currentExtensionInfo, checkingBrowserHostExtensionId } = state;

  useEffect(() => {
    dispatcher.getExtensionsInfo();
  }, []);

  const handleInstall = async (packageInfo: PackageInfo) => {
    const { packagePath, link, options: { browserType }, id } = packageInfo;
    dispatcher.addCheckingBrowserHostExtensionId(id);
    const hostIsAccessible = await dispatcher.checkBrowserHostIsAccessible(browserType);
    dispatcher.removeCheckingBrowserHostExtensionId(id);

    if (hostIsAccessible) {
      openDialog(hostIsAccessible, packagePath, link, browserType);
    } else {
      installBrowserExtension(packageInfo);
    }
  };

  const installBrowserExtension = (packageInfo: PackageInfo) => {
    ipcRenderer
      .invoke('install-browser-extension', {
        packageInfo,
        installChannel: INSTALL_EXTENSION_CHANNEL,
        processChannel: INSTALL_EXTENSION_STATUS_CHANNEL,
      })
      .catch((error) => {
        Message.error(error.message);
      });
  };

  const openDialog = (hostIsAccessible: boolean, packagePath: string, link?: string, browserType?: string) => {
    const dialog = Dialog.show({
      title: '??????',
      style: { width: 500 },
      height: hostIsAccessible ? '220px' : '170px',
      content: (
        <div className={styles.dialog}>
          {hostIsAccessible ? (
            <div>Toolkit ????????????????????????????????????????????????????????? {browserType} ??????????????????????????????????????????????????????????????????????????????</div>
          ) : (
            <>
              <Button
                type="primary"
                text
                onClick={() => shell.showItemInFolder(packagePath)}
              >
                ???????????????<CustomIcon size={14} type="tiaozhuan-zhuanqu" />
              </Button>
              ???????????????????????????????????????????????????????????????????????????
              <br />
              <div>??????????????????????????????<a href="https://github.com/appworks-lab/toolkit#?????????????????????" target="_blank" rel="noreferrer">??????</a>???</div>
            </>
          )}
        </div>
      ),
      footer: !!hostIsAccessible,
      onOk: () => {
        if (hostIsAccessible) {
          shell.openExternal(link);
          dialog.hide();
        }
      },
      okProps: {
        children: '??????',
      },
    });
  };

  const showDetailPage = (appInfo: PackageInfo) => {
    dispatcher.setDetailVisible(true);
    dispatcher.setCurrentExtensionInfo(appInfo);
  };

  const goBack = () => {
    dispatcher.setDetailVisible(false);
    dispatcher.setCurrentExtensionInfo({} as any);
  };

  const Operation = ({ packageInfo }: { packageInfo: PackageInfo }) => {
    const { versionStatus, id } = packageInfo;
    let installStatus;

    const installStatusIndex = installStatuses.findIndex((item) => id === item.id);
    if (installStatusIndex > -1) {
      installStatus = installStatuses[installStatusIndex].status;
    }
    return (
      <>
        {
          versionStatus === 'installed' ? (
            <span style={{ color: 'gray', fontSize: 12 }}>?????????</span>
          ) : (
            <Button text type="primary" style={installBtnStyle} onClick={async () => handleInstall(packageInfo)}>
              {installStatus || (checkingBrowserHostExtensionId.includes(id) && effectsState.checkBrowserHostIsAccessible.isLoading) ? (
                <Icon type="loading" />
              ) : (
                '??????'
              )}
            </Button>
          )
        }
      </>
    );
  };

  useEffect(() => {
    function handleUpdateInstallStatus(e: IpcRendererEvent, installStatus: ProcessStatus) {
      const { status, errMsg, packagePath } = installStatus;

      if (REMOVE_STATE_STATUSES.includes(status)) {
        dispatcher.removeInstallStatus(installStatus);
      }

      switch (status) {
        case 'done':
          dispatcher.getExtensionsInfo();
          break;
        case 'error':
          Message.error(errMsg);
          break;
        case 'finish':
          openDialog(false, packagePath);
          break;
        default:
          dispatcher.updateInstallStatus(installStatus);
          break;
      }
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
    if (effectsState.getExtensionsInfo.error) {
      Message.error(effectsState.getExtensionsInfo.error.message);
    }
  }, [effectsState.getExtensionsInfo.error]);

  if (detailVisible) {
    return (
      <AppDetail
        goBack={goBack}
        operation={<Operation packageInfo={currentExtensionInfo as PackageInfo} />}
        {...currentExtensionInfo as PackageInfo}
      />
    );
  }
  return (
    <>
      <PageHeader title="???????????????" />
      <Loading className={styles.extensionsList} visible={effectsState.getExtensionsInfo.isLoading}>
        {
          extensionsInfo.map((extensionInfo: BrowserExtensionsInfo) => (
            <div className={styles.extensionInfo} key={extensionInfo.id}>
              <div className={styles.title}>{extensionInfo.title}</div>
              {extensionInfo.versionStatus === 'uninstalled' ? (
                <BrowserNotInstalled browser={extensionInfo.id} />
              ) : (
                <Row wrap gutter={8}>
                  {
                  extensionInfo.extensions.map((packageInfo: PackageInfo, index: number) => (
                    <Col s={12} l={8} key={packageInfo.id}>
                      <AppCard
                        {...packageInfo}
                        operation={<Operation packageInfo={packageInfo} />}
                        showSplitLine={extensionInfo.extensions.length - (extensionInfo.extensions.length % 2 ? 1 : 2) > index}
                        showDetailPage={() => showDetailPage(packageInfo)}
                      />
                    </Col>
                  ))
                }
                </Row>
              )}
            </div>
          ))
        }
        <Dialog title="????????????" />
      </Loading>
    </>
  );
};

export default ExtensionList;
