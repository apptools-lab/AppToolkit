import { FC, useEffect } from 'react';
import { Dialog, Form, Field, Input, Message, Button, Balloon } from '@alifd/next';
import CustomIcon from '@/components/Icon';
import GitDirFormItemLabel from '../GitDirFormItemLabel';
import store from '../../store';
import styles from './index.module.scss';

const { Tooltip } = Balloon;

const UserGitConfigDialogForm: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('git');
  const effectsState = store.useModelEffectsState('git');

  const { userGitConfigFormVisible, existedUserGitConfigNames } = state;

  const field = Field.useField({ parseName: true });

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  const submit = async () => {
    const { errors } = await field.validatePromise();
    if (errors) {
      return;
    }

    const values = field.getValues() as any;
    const res = await dispatcher.addUserGitConfig(values);
    if (res) {
      Message.success(`新增 ${values.configName} 配置成功`);
      close();
      dispatcher.getUserGitConfigs();
    }
  };

  const close = () => {
    dispatcher.setUserGitConfigFormVisible(false);
  };

  useEffect(() => {
    if (effectsState.addUserGitConfig.error) {
      Message.error(effectsState.addUserGitConfig.error.message);
    }
  }, [effectsState.addUserGitConfig.error]);

  useEffect(() => {
    dispatcher.getExistedUserGitConfigs();
  }, []);

  const onGenerateSSHKeyClick = async () => {
    const { user: { email: userEmail }, configName } = field.getValues();
    const pubKey = await dispatcher.generateSSHKey({ configName, userEmail });
    if (pubKey) {
      Message.success(`生成 ${configName} SSH 公钥成功`);
      field.setValue('SSHPublicKey', pubKey);
    }
  };

  // const validateGitConfigName = (rule: any, setValue: string, callback: (error?: string) => void) => {
  //   if (existedUserGitConfigNames.includes(setValue)) {
  //     return callback('配置名已存在，请重新输入');
  //   }
  //   return callback();
  // };

  const checkIsGenerateSSHKeyBtnDisabled = () => {
    const { user = {}, configName } = field.getValues();
    const { email: userEmail } = user as any;
    if (existedUserGitConfigNames.includes(configName)) {
      return true;
    }
    return !(userEmail && configName);
  };

  const isGenerateSSHKeyBtnDisabled = checkIsGenerateSSHKeyBtnDisabled();

  const generateSSHKeyBtn = (
    <Button
      type="primary"
      text
      onClick={onGenerateSSHKeyClick}
      disabled={isGenerateSSHKeyBtnDisabled}
      loading={effectsState.generateSSHKey.isLoading}
    >
      一键生成
    </Button>
  );
  return (
    <Dialog
      visible={userGitConfigFormVisible}
      title={'新增用户配置'}
      style={{ width: 600 }}
      onOk={submit}
      onCancel={close}
      closeable={false}
    >
      <Form {...formItemLayout} field={field} labelAlign="left" style={{ paddingLeft: 40, paddingRight: 40 }}>
        <Form.Item
          label="配置名称"
          required
          requiredMessage="请输入配置名称"
          pattern={/^[a-z]([-_a-z0-9]*)$/i}
          patternMessage="请输入字母和数字的组合，以字母开头，如 Github"
          // validator={validateGitConfigName}
        >
          <Input name="configName" placeholder="请输入配置名称，仅支持字母和数字的组合，如 Github" />
        </Form.Item>
        <Form.Item
          label="Git 服务器域名"
          required
          requiredMessage="请输入 Git 服务器域名，如 github.com"
        >
          <Input name="hostName" placeholder="请输入 Git 服务器域名" />
        </Form.Item>
        <Form.Item
          label="用户名"
          required
          requiredMessage="请输入用户名"
        >
          <Input name="user.name" placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item
          label="邮箱"
          required
          requiredMessage="请输入邮箱"
          format="email"
          formatMessage="不是合法的 email 地址"
        >
          <Input name="user.email" placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item
          label="SSH 公钥"
          required
          requiredMessage="请生成点击『一键生成』以生成 SSH 公钥"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {
            field.getValue('SSHPublicKey') ? (
              <Input.TextArea name="SSHPublicKey" readOnly />
            ) : (
              <>
                {
                  isGenerateSSHKeyBtnDisabled ? (
                    <Tooltip
                      trigger={generateSSHKeyBtn}
                      align="t"
                      delay={200}
                    >
                      请输入『配置名称』和『邮箱』后，再生成 SSH 公钥。
                    </Tooltip>
                  ) : (
                    <>{generateSSHKeyBtn}</>
                  )
                }
              </>
            )
          }
        </Form.Item>
      </Form>
    </Dialog>
  );
};

export default UserGitConfigDialogForm;
