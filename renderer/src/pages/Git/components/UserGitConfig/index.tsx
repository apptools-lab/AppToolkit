import { FC, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Field, Message, Grid, Input } from '@alifd/next';
import removeObjEmptyValue from '@/utils/removeObjEmptyValue';
import Icon from '@/components/Icon';
import store from '../../store';
import SSHKeyFormItemLabel from '../SSHKeyFormItemLabel';
import GitDirsForm from '../GitDirsForm';
import HostNameFormItemLabel from '../HostNameFormItemLabel';
import styles from './index.module.scss';

const { Row, Col } = Grid;

export interface UserGitConfigProps {
  gitDirs: Array<{value: string; id: number}>;
  configName: string;
  SSHPublicKey?: string;
  [k: string]: any;
  refresh: () => Promise<void>;
}

const UserGitConfig: FC<UserGitConfigProps> = ({ configName, gitDirs, SSHPublicKey, refresh, ...props }) => {
  const [, dispatcher] = store.useModel('git');
  const effectsState = store.useModelEffectsState('git');

  const initValues = { ...props };

  const field = Field.useField({
    parseName: true,
    onChange: debounce(async () => {
      const values: any = field.getValues();
      await dispatcher.updateUserGitConfig({
        configName,
        gitConfig: removeObjEmptyValue(values),
      });
      Message.success(`更新 ${configName} Git 配置成功`);
      dispatcher.getUserGitConfigs();
    }, 1000),
    values: initValues,
    autoUnmount: false,
  });

  useEffect(() => {
    if (effectsState.updateUserGitConfig.error) {
      Message.error(effectsState.updateUserGitConfig.error.message);
    }
  }, [effectsState.updateUserGitConfig.error]);

  return (
    <div className={styles.userGitConfig}>
      <Row align="center" className={styles.row}>
        <Col span={10} className={styles.label}><HostNameFormItemLabel /></Col>
        <Col span={14}>
          <Input
            {...field.init('user.hostName')}
            className={styles.input}
            placeholder="如 github.com"
          />
        </Col>
      </Row>
      <Row align="center" className={styles.row}>
        <Col span={10} className={styles.label}>用户名</Col>
        <Col span={14}>
          <Input {...field.init('user.name')} className={styles.input} />
        </Col>
      </Row>
      <Row align="center" className={styles.row}>
        <Col span={10} className={styles.label}>邮箱</Col>
        <Col span={14}>
          <Input {...field.init('user.email')} className={styles.input} />
        </Col>
      </Row>
      <Row align="center" className={styles.row}>
        <Col span={10} className={styles.label}>
          <SSHKeyFormItemLabel />
        </Col>
        <Col span={14}>
          <Input
            className={styles.input}
            value={SSHPublicKey}
            innerAfter={
              <CopyToClipboard text={SSHPublicKey} onCopy={() => Message.success('复制成功')}>
                <Icon type="copy" className={styles.copyIcon} />
              </CopyToClipboard>
            }
          />
        </Col>
      </Row>
      <GitDirsForm refresh={refresh} gitDirs={gitDirs} configName={configName} />
    </div>
  );
};

export default UserGitConfig;
