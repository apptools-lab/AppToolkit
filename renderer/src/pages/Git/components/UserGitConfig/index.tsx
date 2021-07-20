import { FC, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Field, Message, Grid, Input, Dialog, Button, Balloon, Collapse } from '@alifd/next';
import Icon from '@/components/Icon';
import removeObjEmptyValue from '@/utils/removeObjEmptyValue';
import BaseGitConfig from '../BaseGitConfig';
import store from '../../store';
import GitDirFormItemLabel from '../GitDirFormItemLabel';
import SSHKeyFormItemLabel from '../SSHKeyFormItemLabel';
import styles from './index.module.scss';

const { Row, Col } = Grid;
const { Tooltip } = Balloon;
const { Panel } = Collapse;

export interface IUserGitConfig {
  gitDir: string;
  configName: string;
  gitConfigPath: string;
  SSHPublicKey?: string;
  [k: string]: any;
}


const UserGitConfig: FC<IUserGitConfig> = ({ configName, gitDir, gitConfigPath, SSHPublicKey, ...props }) => {
  const [, dispatcher] = store.useModel('git');
  const effectsState = store.useModelEffectsState('git');

  const initValues = { ...props, gitDir };

  const onFieldChange = debounce(async () => {
    const values: any = field.getValues();
    await dispatcher.updateUserGitConfig({
      configName,
      gitConfig: removeObjEmptyValue(values),
    });
    Message.success(`更新 ${configName} Git 配置成功`);
    dispatcher.getUserGitConfigs();
  }, 1000);

  const field = Field.useField({
    parseName: true,
    onChange: onFieldChange,
    autoUnmount: false,
    values: initValues,
  });

  useEffect(() => {
    field.setValues({ ...props, gitDir });
  }, [props.length]);

  useEffect(() => {
    if (effectsState.updateUserGitConfig.error) {
      Message.error(effectsState.updateUserGitConfig.error.message);
    }
  }, [effectsState.updateUserGitConfig.error]);


  const onOpenFolderDialog = async () => {
    const folderPath = await dispatcher.getFolderPath();
    if (!folderPath) {
      return;
    }
    field.setValue('gitDir', folderPath);
    const res = await dispatcher.updateUserGitDir({ originGitDir: gitDir, currentGitDir: folderPath });
    if (res) {
      Message.success(`更新 ${configName} Git 配置成功`);
      dispatcher.getUserGitConfigs();
    }
  };

  return (
    <div className={styles.userGitConfig}>
      {/* <div className={styles.header}>
        <div className={styles.title}>配置 - {configName}</div>
        <div className={styles.operation}>
          <Icon type="trash" className={styles.icon} onClick={onRemoveUserGitConfig} />
        </div>
      </div> */}
      {/* <Row align="center" className={styles.row}>
        <Col span={10} className={styles.label}><GitDirFormItemLabel /></Col>
        <Col span={14}>
          <Input
            {...field.init('gitDir')}
            className={styles.input}
            readOnly
            innerAfter={<Icon type="wenjianjia" className={styles.folderIcon} onClick={onOpenFolderDialog} />}
          />
        </Col>
      </Row> */}
      <Row align="center" className={styles.row}>
        <Col span={10} className={styles.label}>Git 服务器域名</Col>
        <Col span={14}>
          <Input
            {...field.init('hostName')}
            className={styles.input}
            placeholder="如 github.com、gitlab.com"
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
      <Row>
        <Col span={10} className={styles.label}>
          <SSHKeyFormItemLabel />
        </Col>
        <Col span={14}>
          <div className={styles.sshPublicKey}>
            <CopyToClipboard
              text={SSHPublicKey}
              onCopy={() => Message.success('复制成功')}
              className={styles.copyToClipboard}
            >
              <Button text type="primary">一键复制</Button>
            </CopyToClipboard>
            <code>{SSHPublicKey}</code>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default UserGitConfig;
