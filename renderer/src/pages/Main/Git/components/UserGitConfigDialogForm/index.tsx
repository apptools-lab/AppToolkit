import { FC, useEffect } from 'react';
import { Dialog, Form, Field, Input, Message, Icon, Button } from '@alifd/next';
import store from '@/pages/Main/store';
import HostNameFormItemLabel from '../HostNameFormItemLabel';
import styles from './index.module.scss';

interface UserGitConfigDialogFormProps {
  refresh: () => Promise<void>;
}

const UserGitConfigDialogForm: FC<UserGitConfigDialogFormProps> = ({ refresh }) => {
  const [state, dispatcher] = store.useModel('git');
  const effectsState = store.useModelEffectsState('git');

  const {
    userGitConfigFormVisible,
    existedUserGitConfigNames,
  } = state;

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
    const { user: { email: userEmail }, configName } = values;
    const pubKey = await dispatcher.generateSSHKey({ configName, userEmail });
    if (!pubKey) {
      return;
    }
    Message.success(`生成 ${configName} SSH 公钥成功`);
    const res = await dispatcher.addUserGitConfig(values);
    if (res) {
      Message.success(`新增 ${values.configName} 配置成功`);
      await refresh();
      close();
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

  const validateGitConfigName = (rule: any, setValue: string, callback: (error?: string) => void) => {
    if (!/^[a-z]([-_a-z0-9]*)$/i.test(setValue)) {
      return callback('请输入字母和数字的组合，以字母开头，如 Github');
    }
    if (existedUserGitConfigNames.includes(setValue)) {
      return callback('配置名已存在，请重新输入');
    }
  };

  const dialogFooter = (
    <div className={styles.dialogFooter}>
      <div className={styles.tip}>
        <Icon type="prompt" className={styles.promptIcon} />
        点击『确定』按钮将默认生成 SSH 公钥
      </div>
      <div>
        <Button type="primary" onClick={submit}>确定</Button>
        <Button onClick={close} className={styles.button}>取消</Button>
      </div>
    </div>
  );
  return (
    <Dialog
      visible={userGitConfigFormVisible}
      title={'新增用户配置'}
      style={{ width: 700 }}
      onOk={submit}
      onCancel={close}
      closeable={false}
      footer={dialogFooter}
      okProps={{ loading: effectsState.generateSSHKey.isLoading || effectsState.addUserGitConfig.isLoading }}
    >
      <Form {...formItemLayout} field={field} labelAlign="left" style={{ paddingLeft: 40, paddingRight: 40 }}>
        <Form.Item
          label="配置名称"
          required
          requiredMessage="请输入配置名称"
          validator={validateGitConfigName}
        >
          <Input name="configName" placeholder="请输入配置名称，仅支持字母和数字的组合，如 Github" />
        </Form.Item>
        <Form.Item
          label={<HostNameFormItemLabel />}
          required
          requiredMessage="请输入 Git 服务器域名，如 github.com"
          pattern={/^(?!http:\/\/|https:\/\/).*/i}
          patternMessage="Git 服务器域名不需要带 http(s)://，如 github.com"
        >
          <Input name="user.hostName" placeholder="请输入 Git 服务器域名，如 github.com" />
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
      </Form>
    </Dialog>
  );
};

export default UserGitConfigDialogForm;
