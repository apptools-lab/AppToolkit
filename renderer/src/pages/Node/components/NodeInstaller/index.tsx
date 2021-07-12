import { useEffect, FC } from 'react';
import { Step, Field, Form, Switch, Select, Loading, Message, Balloon, Icon } from '@alifd/next';
import XtermTerminal from '@/components/XtermTerminal';
import xtermManager from '@/utils/xtermManager';
import { STEP_STATUS_ICON } from '@/constants';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import store from '../../store';
import InstallResult from '../NodeInstallResult';
import styles from './index.module.scss';

interface INodeInstaller {
  managerName: string;
  goBack: () => void;
}

const defaultValues = { reinstallGlobalDeps: true };

const NodeInstaller: FC<INodeInstaller> = ({ managerName, goBack }) => {
  const [state, dispatchers] = store.useModel('nodeVersion');
  const {
    nodeInstallChannel,
    nodeInstallProcessStatusChannel,
    nodeInstallFormValue,
    currentStep,
    nodeVersions,
    nodeInstallStatus,
    nodeInstallVisible,
  } = state;
  const effectsLoading = store.useModelEffectsLoading('nodeVersion');
  const effectsErrors = store.useModelEffectsError('nodeVersion');

  useEffect(() => {
    if (effectsErrors.getNodeVersions.error) {
      Message.error(effectsErrors.getNodeVersions.error.message);
    }
  }, [effectsErrors.getNodeVersions.error]);

  useEffect(() => {
    if (effectsErrors.getNodeInfo.error) {
      Message.error(effectsErrors.getNodeInfo.error.message);
    }
  }, [effectsErrors.getNodeInfo.error]);

  const TERM_ID = 'node';
  const steps = [
    { title: '选择版本', name: 'selectedVersion' },
    { title: '安装 Node.js', name: 'installNode' },
    { title: '重装全局依赖', name: 'reinstallPackages' },
    { title: '完成', name: 'finish' },
  ];
  const field = Field.useField({ values: defaultValues });
  const formItemLayout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 16,
    },
  };

  const writeChunk = (
    e: IpcRendererEvent,
    data: { chunk: string; ln?: boolean },
  ) => {
    const { chunk, ln } = data;
    const xterm = xtermManager.getTerm(TERM_ID);
    if (xterm) {
      xterm.writeChunk(chunk, ln);
    }
  };

  const goNext = () => {
    const { nodeVersion } = store.getState();
    dispatchers.updateStep(nodeVersion.currentStep + 1);
  };

  const submit = async () => {
    const { errors } = await field.validatePromise();
    if (errors) {
      return;
    }
    const values = field.getValues() as object;
    const xterm = xtermManager.getTerm(TERM_ID);
    if (xterm) {
      xterm.clear(TERM_ID);
    }
    dispatchers.updateNodeInstallFormValue(values);
    await ipcRenderer.invoke(
      'install-node',
      {
        managerName,
        ...values,
        installChannel: nodeInstallChannel,
        processChannel: nodeInstallProcessStatusChannel,
      },
    );
    goNext();
  };


  let mainbody: JSX.Element;

  switch (currentStep) {
    case 0:
      mainbody = (
        <Form
          {...formItemLayout}
          field={field}
          fullWidth
          labelAlign="left"
          className={styles.form}
          onChange={dispatchers.updateNodeInstallFormValue}
        >
          <Form.Item
            label="Node 版本"
            required
            requiredMessage="请选择一个 Node 版本"
          >
            <Select
              name="nodeVersion"
              placeholder="请选择一个 Node 版本"
              showSearch
            >
              {
                nodeVersions.majors.map(({ version, title }) => (
                  <Select.Option key={version} value={version}>{title}</Select.Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <span className={styles.label}>
                重装全局依赖
                <Balloon type="primary" trigger={<Icon type="help" size="medium" />} closable={false}>
                  安装一个新版本的 Node.js 后，原来全局 npm 包可能会不可用。
                  选择此选项会自动把原来的 npm 包适配到新版本的 Node.js 中。
                </Balloon>
              </span>}
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
    case 2:
      mainbody = (
        <div className={styles.term}>
          <XtermTerminal id={TERM_ID} name={TERM_ID} options={{ rows: 32 }} />
        </div>
      );
      break;
    case 3:
      mainbody = <InstallResult goBack={goBack} reinstallGlobalDeps={nodeInstallFormValue.reinstallGlobalDeps} />;
      break;
    default:
      break;
  }

  const stepComponents = steps.map(
    (item, index) => (
      <Step.Item
        className={styles.stepItem}
        aria-current={index === currentStep ? 'step' : null}
        key={item.name}
        title={item.title}
        disabled={index === 2 && !nodeInstallFormValue.reinstallGlobalDeps}
        icon={
          ((index === 1 || index === 2) && currentStep === index) ? STEP_STATUS_ICON[nodeInstallStatus[item.name]] : undefined
        }
      />
    ),
  );

  useEffect(() => {
    dispatchers.getNodeVersions();
  }, []);

  useEffect(() => {
    if (nodeInstallVisible) {
      dispatchers.getCaches({ installChannel: nodeInstallChannel, processChannel: nodeInstallProcessStatusChannel });
    }
  }, []);

  useEffect(() => {
    ipcRenderer.on(nodeInstallChannel, writeChunk);
    return () => {
      ipcRenderer.removeListener(nodeInstallChannel, writeChunk);
    };
  }, []);

  function handleUpdateInstallStatus(e: IpcRendererEvent, { task, status, errMsg, result }) {
    if (status === 'done') {
      return;
    }
    dispatchers.updateNodeInstallStatus({ status, stepName: task });
    if (status === 'process') {
      return;
    } else if (status === 'error') {
      dispatchers.updateNodeInstallErrMsg({ errMsg, stepName: task });
    } else if (status === 'success' && result) {
      dispatchers.updateInstallResult(result);
    }
    goNext();
  }

  useEffect(() => {
    ipcRenderer.on(nodeInstallProcessStatusChannel, handleUpdateInstallStatus);
    return () => {
      ipcRenderer.removeListener(
        nodeInstallProcessStatusChannel,
        handleUpdateInstallStatus,
      );
    };
  }, []);
  return (
    <div>
      <Step current={currentStep} className={styles.step} shape="dot" stretch>
        {stepComponents}
      </Step>
      <Loading visible={effectsLoading.getNodeVersions} className={styles.loading} tip="获取 Node.js 版本中...">
        {mainbody}
      </Loading>
    </div>
  );
};

export default NodeInstaller;
