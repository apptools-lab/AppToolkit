import { FC, useEffect } from 'react';
import { ipcRenderer, IpcRendererEvent, shell } from 'electron';
import { Grid, Button, Message, Icon, Loading, Dialog } from '@alifd/next';
import AppCard from '@/components/AppCard';
import CustomIcon from '@/components/Icon';
import store from '../../store';
import styles from './index.module.scss';
import { PackageInfo, ProcessStatus } from '@/interfaces/base';
import { BrowserExtensionsInfo } from '@/interfaces/browserExtension';
import BrowserNotInstalled from '../BrowserNotInstalled';

const { Row, Col } = Grid;

const INSTALL_EXTENSION_CHANNEL = 'install-browser-extension';
const INSTALL_EXTENSION_STATUS_CHANNEL = 'install-browser-extension-process-status';

const ExtensionList: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('browserExtension');
  const effectsState = store.useModelEffectsState('browserExtension');

  const { extensionsInfo, installStatuses } = state;

  useEffect(() => {
    dispatcher.getExtensionsInfo();
  }, []);

  const handleInstall = async (packageInfo: PackageInfo) => {
    const { packagePath, link, options: { browserType } } = packageInfo;
    const alive = await dispatcher.checkBrowserHostAlive(browserType);

    if (alive) {
      openDialog(alive, packagePath, link, browserType);
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

  const openDialog = (alive: boolean, packagePath: string, link?: string, browserType?: string) => {
    const dialog = Dialog.show({
      title: '提示',
      style: { width: 500 },
      height: alive ? '220px' : '170px',
      content: (
        <div className={styles.dialog}>
          {alive ? (
            <div>Toolkit 目前不能自动安装浏览器插件，需要自行在 {browserType} 应用商店安装。点击下方确定按钮将跳转到插件安装页面。</div>
          ) : (
            <>
              <div>
                <Button
                  type="primary"
                  className={styles.btn}
                  text
                  onClick={() => shell.showItemInFolder(packagePath)}
                >
                  插件安装包<CustomIcon className={styles.icon} type="tiaozhuan-zhuanqu" />
                </Button>
                已下载到本地，请自行在浏览器的扩展程序管理中安装。
              </div>
              <br />
              <div>详细的安装方式请参考<a href="https://appworks.site/pack/basic/toolkit.html" target="_blank" rel="noreferrer">文档</a>。</div>
            </>
          )}
        </div>
      ),
      footer: !!alive,
      onOk: () => {
        if (alive) {
          shell.openExternal(link);
          dialog.hide();
        }
      },
      okProps: {
        children: '确定',
      },
    });
  };

  const Operation = ({ packageInfo }: { packageInfo: PackageInfo }) => {
    const { versionStatus } = packageInfo;
    let installStatus;

    const installStatusIndex = installStatuses.findIndex(({ id }) => id === packageInfo.id);
    if (installStatusIndex > -1) {
      installStatus = installStatuses[installStatusIndex].status;
    }
    return (
      <>
        {
          versionStatus === 'installed' ? (
            <span style={{ color: 'gray' }}>已安装</span>
          ) : (
            <Button text type="primary" className={styles.btn} onClick={async () => handleInstall(packageInfo)}>
              {installStatus || effectsState.checkBrowserHostAlive.isLoading ? <Icon type="loading" /> : '安装'}
            </Button>
          )
        }
      </>
    );
  };

  useEffect(() => {
    function handleUpdateInstallStatus(e: IpcRendererEvent, installStatus: ProcessStatus) {
      const { status, errMsg, packagePath } = installStatus;
      if (status === 'finish') {
        openDialog(false, packagePath);
      }
      if (status === 'finish' || status === 'error') {
        dispatcher.removeInstallStatus(installStatus);
        dispatcher.getExtensionsInfo();
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
    if (effectsState.getExtensionsInfo.error) {
      Message.error(effectsState.getExtensionsInfo.error.message);
    }
  }, [effectsState.getExtensionsInfo.error]);

  return (
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
                     />
                   </Col>
                 ))
               }
              </Row>
            )}

          </div>
        ))
      }
      <Dialog title="安装提示" />
    </Loading>
  );
};

export default ExtensionList;
