import { FC, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Field, Message, Grid, Input, Dialog, Button, Balloon } from '@alifd/next';
import Icon from '@/components/Icon';
import removeObjEmptyValue from '@/utils/removeObjEmptyValue';
import BaseGitConfig from '../BaseGitConfig';
import store from '../../store';
import GitDirFormItemLabel from '../GitDirFormItemLabel';
import SSHKeyFormItemLabel from '../SSHKeyFormItemLabel';
import styles from './index.module.scss';

const { Row, Col } = Grid;
const { Tooltip } = Balloon;

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
      gitConfigPath,
      configName,
      currentGitConfig: removeObjEmptyValue(values),
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

  const onRemoveUserGitConfig = () => {
    Dialog.confirm({
      title: '提示',
      content: `是否删除 ${configName} 配置？`,
      onOk: async () => {
        const res = await dispatcher.removeUserGitConfig({ configName, gitConfigPath, gitDir });
        if (res) {
          Message.success(`删除 ${configName} Git 配置成功`);
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
      Message.success(`更新 ${configName} Git 配置成功`);
      dispatcher.getUserGitConfigs();
    }
  };

  const onGenerateSSHKeyClick = async () => {
    const { user: { name: userName, email: userEmail }, hostName } = field.getValues();
    const res = await dispatcher.generateSSHKeyAndConfig({ configName, hostName, userEmail, userName });
    if (res) {
      Message.success(`生成 ${configName} SSH 密钥成功`);
      dispatcher.getUserGitConfigs();
    }
  };

  const checkIsGenerateSSHKeyBtnDisabled = () => {
    const { user = {}, hostName } = field.getValues();
    const { name: userName, email: userEmail } = user as any;
    return !(userName && userEmail && hostName);
  };

  const isGenerateSSHKeyBtnDisabled = checkIsGenerateSSHKeyBtnDisabled();

  const generateSSHKeyBtn = (
    <Button
      type="primary"
      text
      onClick={onGenerateSSHKeyClick}
      disabled={isGenerateSSHKeyBtnDisabled}
      loading={effectsState.generateSSHKeyAndConfig.isLoading}
    >
      一键生成
    </Button>
  );
  return (
    <>
      <div className={styles.header}>
        <div className={styles.title}>配置 - {configName}</div>
        <div className={styles.operation}>
          <Icon type="trash" className={styles.icon} onClick={onRemoveUserGitConfig} />
        </div>
      </div>
      <Row align="center" className={styles.row}>
        <Col span={10} className={styles.label}><GitDirFormItemLabel /></Col>
        <Col span={14}>
          <Input
            {...field.init('gitDir')}
            className={styles.input}
            readOnly
            innerAfter={<Icon type="wenjianjia" className={styles.folderIcon} onClick={onOpenFolderDialog} />}
          />
        </Col>
      </Row>
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
      <BaseGitConfig field={field} />
      <Row>
        <Col span={10} className={styles.label}>
          {/* <span>
            SSH 公钥
            <Tooltip
              trigger={<Icon type="prompt" style={{ marginLeft: 4 }} />}
              align="t"
              delay={200}
            >
              关于如何添加 SSH 公钥，请查看<a href="https://appworks.site/pack/basic/toolkit.html" target="__blank">文档</a>
            </Tooltip>
          </span> */}
          <SSHKeyFormItemLabel />
        </Col>
        <Col span={14}>
          {
            SSHPublicKey ? (
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
            ) : (
              <>
                {
                  isGenerateSSHKeyBtnDisabled ? (
                    <Tooltip
                      trigger={generateSSHKeyBtn}
                      align="t"
                      delay={200}
                    >
                      请输入『Git 服务器域名』、『用户名』和『邮箱』后，再生成 SSH 公钥。
                    </Tooltip>
                  ) : (
                    <>{generateSSHKeyBtn}</>
                  )
                }
              </>
            )
          }
        </Col>
      </Row>
    </>
  );
};

export default UserGitConfig;
