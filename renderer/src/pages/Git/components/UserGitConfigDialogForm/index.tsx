import { FC } from 'react';
import { Dialog, Form, Field, Input, Message } from '@alifd/next';
import CustomIcon from '@/components/Icon';
import GitDirFormItemLabel from '../GitDirFormItemLabel';
import store from '../../store';
import styles from './index.module.scss';

export interface DataSource {
  name: string;
  gitDir: string;
}

export interface DialogFormProps {
  visible: boolean;
  type: 'add' | 'edit';
  dataSource?: DataSource;
  onSubmit: any;
  onVisibleChange: (visible: boolean) => void;
}

const UserGitConfigDialogForm: FC<DialogFormProps> = (props) => {
  const {
    type,
    visible,
    dataSource = { name: '', gitDir: '' },
    onSubmit = () => {},
    onVisibleChange = () => {},
  } = props;
  const [, dispatcher] = store.useModel('git');

  const field = Field.useField({ values: dataSource });

  const submit = async () => {
    const { errors } = await field.validatePromise();
    if (errors) {
      return;
    }

    const values = field.getValues() as DataSource;
    let res;
    if (type === 'add') {
      res = await onSubmit(values);
    } else if (type === 'edit') {
      res = await onSubmit({ originGitConfig: dataSource, currentGitConfig: values });
    }
    if (res) {
      Message.success(`${type === 'add' ? '新增' : '更新'} ${values.name} 配置成功`);
      onVisibleChange(false);
      dispatcher.getUserGitConfigs();
    }
  };

  const close = () => {
    onVisibleChange(false);
  };

  const onOpenFolderDialog = async () => {
    const folderPath = await dispatcher.getFolderPath();
    if (!folderPath) {
      return;
    }
    field.setValue('gitDir', folderPath);
  };

  return (
    <Dialog
      visible={visible}
      title={`${type === 'add' ? '新增' : '更新'} Git 配置`}
      style={{ width: 600 }}
      onOk={submit}
      onCancel={close}
      closeable={false}
    >
      <Form field={field} style={{ paddingLeft: 40, paddingRight: 40 }}>
        <Form.Item
          label="配置名称"
          required
          requiredMessage="请输入配置名称"
          pattern={/^[a-z]([-_a-z0-9]*)$/i}
          patternMessage="请输入字母和数字的组合，以字母开头，如 Github"
        >
          <Input name="name" placeholder="请输入配置名称，仅支持字母和数字的组合，以字母开头，如 Github" />
        </Form.Item>
        <Form.Item label={<GitDirFormItemLabel />} required requiredMessage="请选择目录">
          <Input
            name="gitDir"
            placeholder="请选择目录"
            readOnly
            innerAfter={<CustomIcon type="wenjianjia" className={styles.folderIcon} onClick={onOpenFolderDialog} />}
          />
        </Form.Item>
      </Form>
    </Dialog>
  );
};

export default UserGitConfigDialogForm;
