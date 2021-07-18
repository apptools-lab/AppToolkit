import { FC, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Field, Message, Grid, Input, Dialog, Button } from '@alifd/next';
import Icon from '@/components/Icon';
import removeObjEmptyValue from '@/utils/removeObjEmptyValue';
import BaseGitConfig from '../BaseGitConfig';
import store from '../../store';
import styles from './index.module.scss';

const { Row, Col } = Grid;

interface IUserGitConfig {
  gitDir: string;
  name: string;
  sshPublicKey?: string;
  [k: string]: any;
}

const UserGitConfigs: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('git');
  const effectsState = store.useModelEffectsState('git');
  const { userGitConfigs } = state;

  useEffect(() => {
    if (effectsState.getUserGitConfigs.error) {
      Message.error(effectsState.getUserGitConfigs.error.message);
    }
  }, [effectsState.getUserGitConfigs.error]);

  useEffect(() => {
    dispatcher.getUserGitConfigs();
  }, []);
  return (
    <div>
      {userGitConfigs.map((userGitConfig: IUserGitConfig) => (
        <UserGitConfig key={userGitConfig.name} {...userGitConfig} />
      ))}
    </div>
  );
};

const UserGitConfig: FC<IUserGitConfig> = ({ name, gitDir, gitConfigPath, sshPublicKey, ...props }) => {
  const [, dispatcher] = store.useModel('git');
  const effectsState = store.useModelEffectsState('git');

  const onFieldChange = debounce(async () => {
    const values: any = field.getValues();
    await dispatcher.setUserGitConfig({ gitConfigPath, gitConfig: removeObjEmptyValue(values) });
    Message.success(`更新 ${name} Git 配置成功`);
    dispatcher.getUserGitConfigs();
  }, 1000);

  const field = Field.useField({
    parseName: true,
    onChange: onFieldChange,
    autoUnmount: false,
    values: { ...props, gitDir },
  });

  useEffect(() => {
    field.setValues({ ...props, gitDir });
  }, [props.length]);

  useEffect(() => {
    if (effectsState.setUserGitConfig.error) {
      Message.error(effectsState.setUserGitConfig.error.message);
    }
  }, [effectsState.setUserGitConfig.error]);

  const onRemoveUserGitConfig = () => {
    Dialog.confirm({
      title: '提示',
      content: `是否删除 ${name} 配置？`,
      onOk: async () => {
        const res = await dispatcher.removeUserGitConfig({ gitConfigPath, gitDir });
        if (res) {
          Message.success(`删除 ${name} Git 配置成功`);
          dispatcher.getUserGitConfigs();
        }
      },
    });
  };

  const onOpenFolderDialog = async () => {
    const folderPath = await dispatcher.getFolderPath();
    if (!folderPath) {
      return;
    }
    field.setValue('gitDir', folderPath);
    const res = await dispatcher.updateUserGitDir({ originGitDir: gitDir, currentGitDir: folderPath });
    if (res) {
      Message.success(`更新 ${name} Git 配置成功`);
      dispatcher.getUserGitConfigs();
    }
  };
  return (
    <>
      <div className={styles.header}>
        <div className={styles.title}>{name} 配置</div>
        <div className={styles.operation}>
          <Icon type="trash" className={styles.icon} onClick={onRemoveUserGitConfig} />
        </div>
      </div>
      <Row align="center" className={styles.row}>
        <Col span={12} className={styles.label}>用户名</Col>
        <Col span={12}>
          <Input
            {...field.init('gitDir')}
            className={styles.input}
            readOnly
            innerAfter={<Icon type="wenjianjia" className={styles.folderIcon} onClick={onOpenFolderDialog} />}
          />
        </Col>
      </Row>
      <BaseGitConfig field={field} />
      <Row>
        <Col span={12} className={styles.label}>SSH 公钥</Col>
        <Col span={12} className={styles.sshPublicKey}>
          <CopyToClipboard
            text={sshPublicKey || ''}
            onCopy={() => Message.success('复制成功')}
            className={styles.copyToClipboard}
          >
            <Button text type="primary">一键复制</Button>
          </CopyToClipboard>
          <code >{sshPublicKey}</code>
        </Col>
      </Row>
    </>
  );
};

export default UserGitConfigs;
