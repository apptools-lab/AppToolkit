import { FC, useEffect } from 'react';
import { IBasePackage } from '@/interfaces';
import { Dialog, Field, Form, Select, Switch } from '@alifd/next';
import store from '../../store';
import styles from './index.module.scss';

interface ISwitchVersionDialog {
  managerName: string;
  onCancel: () => void;
  onOk: (value: any) => void;
}

const SwitchVersionDialog: FC<ISwitchVersionDialog> = ({
  managerName,
  onCancel,
  onOk,
}) => {
  const [state, dispatchers] = store.useModel('node');
  const { nodeVersionsList } = state;

  const field = Field.useField({
    values: {
      reinstallGlobalDeps: true,
    },
  });

  const onFormSubmit = async () => {
    const { errors } = await field.validatePromise();
    if (errors && errors.length > 0) {
      return;
    }
    await onOk(field.getValues());
  };

  useEffect(() => {
    async function getNodeVersionsList() {
      await dispatchers.getNodeVersionsList(managerName);
    }
    if (!nodeVersionsList.length) {
      getNodeVersionsList();
    }
  }, []);
  console.log('nodeVersionsList: ', nodeVersionsList);

  return (
    <Dialog
      title="提示"
      onCancel={onCancel}
      closeable={false}
      onOk={onFormSubmit}
      visible
      className={styles.dialog}
    >
      <Form labelAlign="left" field={field} fullWidth className={styles.form}>
        <Form.Item
          label="Node 版本"
          required
          requiredMessage="请选择一个 Node 版本"
        >
          <Select name="nodeVersion" placeholder="请选择一个 Node 版本">
            {
              nodeVersionsList.map((nodeVersion: string) => (
                <Select.Option key={nodeVersion} value={nodeVersion}>{nodeVersion}</Select.Option>
              ))
            }
          </Select>
        </Form.Item>
        <Form.Item
          label="重装全局依赖"
          required
          requiredMessage="请选择是否重装全局依赖"
        >
          <Switch name="reinstallGlobalDeps" />
        </Form.Item>
      </Form>
    </Dialog>
  );
};

export default SwitchVersionDialog;
