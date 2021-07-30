import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Dialog, Form, Input, Progress } from '@alifd/next';
import { useEffect } from 'react';
import store from '../../store';

const CustomGlobalDepsDialog = () => {
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };
  const [state, dispatcher] = store.useModel('npmDependency');
  const { globalDependenciesInfo: { currentPath, recommendedPath } } = state;
  const { customGlobalDepsDialogVisible, customGlobalDepsProcess } = state;

  const channel = 'create-custom-global-deps-dir';

  const onOk = async () => {
    await dispatcher.createCustomGlobalDepsDir({ channel, currentGlobalDepsPath: currentPath });
  };

  const onCancel = async () => {
    await ipcRenderer.invoke(
      'cancel-create-custom-global-dependencies-dir',
      channel,
    );
    onClose();
  };

  const onClose = () => {
    dispatcher.setCustomGlobalDepsDialogVisible(false);
    dispatcher.getGlobalDependenciesInfo();
    dispatcher.initCustomGlobalDepsProcess();
  };

  useEffect(() => {
    function handleUpdateStatus(e: IpcRendererEvent, data) {
      dispatcher.setCustomGlobalDepsProcess(data);
      if (data.status === 'done') {
        onClose();
      }
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
      closeable={false}
      okProps={{
        children: '确定',
        loading: customGlobalDepsProcess.status === 'process',
      }}
      onOk={onOk}
      onCancel={onCancel}
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
      {customGlobalDepsProcess.status && (
        <>
          <Progress percent={customGlobalDepsProcess.percent} size="medium" />
          <div
            style={{ marginTop: 4, color: customGlobalDepsProcess.status === 'error' ? 'red' : '#666666' }}
          >
            {customGlobalDepsProcess.message}
          </div>
        </>
      )}
    </Dialog>
  );
};

export default CustomGlobalDepsDialog;
