import styles from './index.module.scss';
import { Button } from '@alifd/next';
import { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

const Updater = () => {
  const [latestVersion, setLatestVersion] = useState('');
  const [currentVersion, setCurrentVersion] = useState('');
  const [changelog, setChangelog] = useState({ logs: [] });

  useEffect(() => {
    function handleUpdatedInfo(e, info) {
      setLatestVersion(info.latestVersion);
      setCurrentVersion(info.currentVersion);
      setChangelog(info.changelog);
    }

    ipcRenderer.on('update-info', handleUpdatedInfo);

    return () => { ipcRenderer.removeListener('update-info', handleUpdatedInfo); };
  }, []);

  const onAppQuitInstall = () => {
    ipcRenderer.invoke('app-quit-install');
  };
  return (
    <div className={styles.updaterContainer}>
      <div className={styles.title}>新版本的 AppToolkit 已经发布</div>
      <div>您当前的版本为 {currentVersion}，最新版本为 {latestVersion}，是否立即升级？</div>
      <div className={styles.changelog}>
        <strong>更新日志</strong>
        <ul>
          {Array.isArray(changelog.logs) && changelog.logs.map((item) => {
            return (<li key={item}>{item}</li>);
          })}
          <li>
            123
          </li>
        </ul>
      </div>
      <div className={styles.btnWrap}>
        <Button size="small" type="primary" onClick={onAppQuitInstall}>马上升级</Button>
      </div>
    </div>
  );
};

export default Updater;
