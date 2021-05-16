import { useEffect, FC } from 'react';
import { Step, Button, Field, Form, Box, Icon, Typography, Switch, Select, Loading, Message } from '@alifd/next';
import XtermTerminal from '@/components/XtermTerminal';
import xtermManager from '@/utils/xtermManager';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import store from '../../store';
import styles from './index.module.scss';

interface IInstallStep {
  managerName: string;
  INSTALL_NODE_CHANNEL: string;
  goBack: () => void;
}

const defaultValues = { reinstallGlobalDeps: true };

const InstallStep: FC<IInstallStep> = ({ managerName, INSTALL_NODE_CHANNEL, goBack }) => {
  const [state, dispatchers] = store.useModel('node');
  const { currentStep, nodeVersionsList, installStatus, installErrMsg } = state;
  const effectsLoading = store.useModelEffectsLoading('node');
  const effectsErrors = store.useModelEffectsError('node');

  useEffect(() => {
    if (effectsErrors.getNodeVersionsList.error) {
      Message.error(effectsErrors.getNodeVersionsList.error.message);
    }
  }, [effectsErrors.getNodeVersionsList.error]);

  useEffect(() => {
    if (effectsErrors.getNodeInfo.error) {
      Message.error(effectsErrors.getNodeInfo.error.message);
    }
  }, [effectsErrors.getNodeInfo.error]);

  const TERM_ID = 'node';
  const INSTALL_PROCESS_STATUS_CHANNEL = 'install-node-process-status';

  const writeChunk = (
    e: IpcRendererEvent,
    data: { chunk: string; ln?: boolean },
  ) => {
    const { chunk, ln } = data;
    const xterm = xtermManager.getTerm(TERM_ID);
    xterm.writeChunk(chunk, ln);
  };

  const field = Field.useField({ values: defaultValues });

  const goNext = () => {
    const { node } = store.getState();
    dispatchers.updateStep(node.currentStep + 1);
  };

  const submit = async () => {
    const { errors } = await field.validatePromise();
    if (errors) {
      return;
    }
    const { nodeVersion, reinstallGlobalDeps } = field.getValues();
    await ipcRenderer.invoke(
      'install-node',
      {
        managerName,
        nodeVersion,
        reinstallGlobalDeps,
        installChannel: INSTALL_NODE_CHANNEL,
        processChannel: INSTALL_PROCESS_STATUS_CHANNEL,
      },
    );
    goNext();
  };

  const formItemLayout = {
    labelCol: {
      fixedSpan: 10,
    },
    wrapperCol: {
      span: 14,
    },
  };

  let mainbody: JSX.Element;

  switch (currentStep) {
    case 0:
      mainbody = (
        <Form {...formItemLayout} field={field} fullWidth className={styles.form}>
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
          <Form.Item label=" " className={styles.submitBtn}>
            <Form.Submit type="primary" onClick={submit} validate>
              下一步
            </Form.Submit>
          </Form.Item>
        </Form>
      );
      break;
    case 1:
      mainbody = (
        <div className={styles.term}>
          <XtermTerminal id={TERM_ID} name={TERM_ID} options={{ rows: 30 }} />
        </div>
      );
      break;
    case 2:
      mainbody = (
        <Box align="center">
          {
            installStatus === 'success' && (
              <>
                <Icon type="success-filling" size={72} className={styles.successIcon} />
                <Typography.H1>安装成功</Typography.H1>
                <Typography.Text className={styles.text}>新建终端，输入以下命令，以验证 Node.js 是否安装成功：</Typography.Text>
                <code className={styles.code}>
                  $ node -v
                  <br />
                  $ npm -v
                </code>
              </>
            )
          }
          {
            installStatus === 'error' && (
              <>
                <img src="https://img.alicdn.com/tfs/TB1VOSVoqL7gK0jSZFBXXXZZpXa-72-72.png" className={styles.exceptionImage} alt="img" />
                <Typography.H1>安装失败</Typography.H1>
                <Typography.Text>{installErrMsg}</Typography.Text>
              </>
            )
          }
          <Box margin={40} direction="row">
            <Button type="primary" style={{ marginRight: '5px' }} onClick={goBack}>
              返回
            </Button>
          </Box>
        </Box>
      );
      break;
    default:
      break;
  }

  const steps = ['选择版本', '安装', '完成'].map(
    (item, index) => (
      <Step.Item
        aria-current={index === currentStep ? 'step' : null}
        key={item}
        title={item}
      />
    ),
  );

  async function getNodeVersionsList() {
    await dispatchers.getNodeVersionsList(managerName);
  }

  useEffect(() => {
    if (!nodeVersionsList.length) {
      getNodeVersionsList();
    }
  }, []);

  useEffect(() => {
    ipcRenderer.on(INSTALL_NODE_CHANNEL, writeChunk);
    return () => {
      ipcRenderer.removeListener(INSTALL_NODE_CHANNEL, writeChunk);
    };
  }, []);

  function handleUpdateInstallStatus(e: IpcRendererEvent, { status, errMsg }) {
    dispatchers.updateInstallStatus(status);
    if (status === 'process') {
      return;
    }
    if (status === 'error') {
      dispatchers.updateInstallErrMsg(errMsg);
    }
    goNext();
  }

  useEffect(() => {
    ipcRenderer.on(INSTALL_PROCESS_STATUS_CHANNEL, handleUpdateInstallStatus);
    return () => {
      ipcRenderer.removeListener(
        INSTALL_PROCESS_STATUS_CHANNEL,
        handleUpdateInstallStatus,
      );
    };
  }, []);
  return (
    <div className={styles.installStepContainer}>
      <Step current={currentStep} className={styles.step}>
        {steps}
      </Step>
      <Loading visible={effectsLoading.getNodeVersionsList} className={styles.loading} tip="获取 Node.js 版本中...">
        {mainbody}
      </Loading>
    </div>
  );
};

export default InstallStep;
