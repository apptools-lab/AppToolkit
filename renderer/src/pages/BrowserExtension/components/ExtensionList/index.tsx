import { FC, useEffect } from 'react';
import { ipcRenderer, IpcRendererEvent, shell } from 'electron';
import { Grid, Button, Message, Icon, Loading, Dialog } from '@alifd/next';
import AppCard from '@/components/AppCard';
import CustomIcon from '@/components/Icon';
import store from '../../store';
import styles from './index.module.scss';
import { PackageInfo, ProcessStatus } from '@/interfaces/base';
import { BrowserExtensionsInfo } from '@/interfaces/browserExtension';

const { Row, Col } = Grid;

const ExtensionList: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('browserExtension');
  const effectsState = store.useModelEffectsState('browserExtension');

  const { extensionsInfo, installStatuses } = state;

  const INSTALL_EXTENSION_CHANNEL = 'install-browser-extension';
  const INSTALL_EXTENSION_STATUS_CHANNEL = 'install-browser-extension-process-status';

  useEffect(() => {
    dispatcher.getExtensionsInfo();
  }, []);

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

  const openDialog = (packageInfo: PackageInfo) => {
    Dialog.show({
      title: '提示',
      content: (
        <div style={{ height: 80, lineHeight: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="primary"
              style={{ display: 'flex', alignItems: 'center', marginRight: 5 }}
              text
              onClick={() => shell.showItemInFolder(packageInfo.sourceFilePath)}
            >
              插件安装包<CustomIcon style={{ fontSize: 14 }} type="tiaozhuan-zhuanqu" />
            </Button>
            已下载到本地，请自行在浏览器的扩展程序管理中安装。
          </div>
          <br />
          <div>详细的安装方式请参考<a href="https://appworks.site/pack/basic/toolkit.html">文档</a>。</div>
        </div>
      ),
      footer: false,
    });
  };

  const Operation = ({ packageInfo }) => {
    const { versionStatus } = packageInfo;
    let installStatus;

    const installStatusIndex = installStatuses.findIndex(({ name }) => name === packageInfo.name);
    if (installStatusIndex > -1) {
      installStatus = installStatuses[installStatusIndex].status;
    }

    return (
      <>
        {versionStatus === 'uninstalled' ? (
          <Button text type="primary" className={styles.btn} onClick={() => installBrowserExtension(packageInfo)}>
            {!installStatus ? '安装' : <Icon type="loading" />}
          </Button>
        ) : (
          <Button text type="primary" className={styles.btn} onClick={() => openDialog(packageInfo)}>
            查看
          </Button>
        )}
      </>
    );
  };

  useEffect(() => {
    function handleUpdateInstallStatus(e: IpcRendererEvent, installStatus: ProcessStatus) {
      const { status, errMsg } = installStatus;
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
