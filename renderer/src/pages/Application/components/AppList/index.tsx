import { FC, useEffect } from 'react';
import { Grid, Button } from '@alifd/next';
import AppCard from '@/components/AppCard';
import store from '../../store';
import styles from './index.module.scss';
import { PackageInfo } from '@/interfaces/base';
import { AppInfo } from '@/interfaces/application';

const { Row, Col } = Grid;

const AppList: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('application');
  const { appsInfo } = state;

  useEffect(() => {
    dispatcher.getAppsInfo();
  }, []);

  const Operation = ({ versionStatus }) => {
    return (
      <Button text type="primary" className={styles.btn}>
        {versionStatus === 'uninstalled' ? '安装' : '卸载'}
      </Button>
    );
  };
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
                      operation={<Operation versionStatus={packageInfo.versionStatus} />}
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
