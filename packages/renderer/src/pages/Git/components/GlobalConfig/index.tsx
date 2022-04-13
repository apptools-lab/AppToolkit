import { useEffect } from 'react';
import { Form, Input, Switch } from 'antd';
import { GitConfig } from '../../../../../../types';
import styles from './index.module.scss';

function GlobalConfig() {
  const [form] = Form.useForm();

  const getGlobalGitConfig = async () => {
    const globalConfig = await window.electronAPI.getGlobalGitConfig();
    form.setFieldsValue(globalConfig);
  };

  useEffect(() => {
    getGlobalGitConfig();
  }, []);

  const onValuesChange = async (_, allValues: GitConfig) => {
    await window.electronAPI.setGlobalGitConfig(allValues);
    await getGlobalGitConfig();
  };
  return (
    <div className={styles.globalConfig}>
      <Form
        form={form}
        labelAlign="left"
        colon={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ offset: 6 }}
        onValuesChange={onValuesChange}
      >
        <Form.Item label="用户名" name="user.name">
          <Input />
        </Form.Item>
        <Form.Item label="邮箱" name="user.email">
          <Input />
        </Form.Item>
        <Form.Item
          label="忽略文件名大小写"
          name="core.ignorecase"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </div>
  );
}

export default GlobalConfig;