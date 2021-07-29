import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Dialog, Form, Input, Button, Progress } from '@alifd/next';
import { useEffect } from 'react';
import store from '../../store';
import styles from './index.module.scss';

const CustomGlobalDepsDialog = () => {
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };
  const [state, dispatcher] = store.useModel('npmDependency');
  const { globalDependenciesInfo: { currentPath, recommendedPath } } = state;
  const { customGlobalDepsDialogVisible, customGlobalDepsProcess } = state;

  const channel = 'create-custom-global-deps-dir';

  const onClick = async () => {
    await dispatcher.createCustomGlobalDepsDir({ channel, currentGlobalDepsPath: currentPath });
  };

  const onClose = () => {
    dispatcher.setCustomGlobalDepsDialogVisible(false);
  };

  useEffect(() => {
    function handleUpdateStatus(e: IpcRendererEvent, data) {
      dispatcher.setCustomGlobalDepsProcess(data);
    }
    ipcRenderer.on(channel, handleUpdateStatus);
    return () => {
      ipcRenderer.removeListener(channel, handleUpdateStatus);
    };
  }, []);

  const value = {
    currentPath,
    recommendedPath,
  };
  return (
    <Dialog
      visible={customGlobalDepsDialogVisible}
      title="设置全局 npm 依赖路径"
      style={{ width: 600 }}
      footer={false}
      onClose={onClose}
    >
      <Form
        value={value}
        {...formItemLayout}
        style={{ paddingLeft: 30, paddingRight: 30 }}
      >
        <Form.Item
          label="当前全局依赖路径"
        >
          <Input name="currentPath" readOnly />
        </Form.Item>
        <Form.Item
          label="推荐全局依赖路径"
        >
          <Input name="recommendedPath" readOnly />
        </Form.Item>
      </Form>
      <div className={styles.footer}>
        <Button onClick={onClick}>转换</Button>
        <span>{customGlobalDepsProcess.message}</span>
        <Progress percent={customGlobalDepsProcess.percent} size="medium" />
      </div>
    </Dialog>
  );
};

export default CustomGlobalDepsDialog;
