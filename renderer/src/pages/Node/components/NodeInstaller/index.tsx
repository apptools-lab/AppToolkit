import { useEffect, FC } from 'react';
import { Step, Field, Button, Form, Select, Loading, Message, Icon, Input, Balloon } from '@alifd/next';
import XtermTerminal from '@/components/XtermTerminal';
import xtermManager from '@/utils/xtermManager';
import { STEP_STATUS_ICON } from '@/constants';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { PackageInfo } from '@/interfaces/base';
import store from '../../store';
import InstallResult from '../NodeInstallResult';
import CustomGlobalDepsPathDialog from '../CustomGlobalDepsPathDialog';
import styles from './index.module.scss';

const { Tooltip } = Balloon;

interface INodeInstaller {
  goBack: () => void;
}

const NodeInstaller: FC<INodeInstaller> = ({ goBack }) => {
  const [state, dispatchers] = store.useModel('nodeVersion');
  const [npmDependencyState, npmDependencyDispatchers] = store.useModel('npmDependency');
  const {
    nodeInstallChannel,
    nodeInstallProcessStatusChannel,
    currentStep,
    nodeVersions,
    nodeInstallStatus,
    nodeInstallVisible,
    nodeInfo,
  } = state;
  const { globalDependenciesInfo } = npmDependencyState;
  const { options = {} } = nodeInfo as PackageInfo;
  const { managerName } = options;
  const effectsLoading = store.useModelEffectsLoading('nodeVersion');
  const effectsErrors = store.useModelEffectsError('nodeVersion');
  const npmDependencyEffectsState = store.useModelEffectsState('npmDependency');

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
    { title: '完成', name: 'finish' },
  ];
  const field = Field.useField();
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
    dispatchers.updateStep((nodeVersion.currentStep as number) + 1);
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

  const onDialogShow = () => {
    npmDependencyDispatchers.setCustomGlobalDepsDialogVisible(true);
  };

  const setCustomGlobalDepsTooltip = (
    <Tooltip trigger={<Icon type="prompt" className={styles.warningIcon} />} align="lt" delay={200} className={styles.tooltip}>
      切换到其他 Node 版本后全局依赖可能不可用，建议在 {globalDependenciesInfo.recommendedPath} 存放全局依赖，这样在新的 Node 版本中依赖仍然可用。
      <Button text onClick={onDialogShow} type="primary">点击设置</Button>
    </Tooltip>
  );

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
          {!globalDependenciesInfo.exists && (
            <Form.Item label="全局 npm 依赖路径">
              <Input
                className={styles.input}
                readOnly
                value={globalDependenciesInfo.currentPath}
                innerAfter={setCustomGlobalDepsTooltip}
              />
            </Form.Item>
          )}
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
          <XtermTerminal id={TERM_ID} name={TERM_ID} options={{ rows: 32 }} />
        </div>
      );
      break;
    case 2:
      mainbody = <InstallResult goBack={goBack} />;
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
        icon={
          (index === 1 && currentStep === index) ? STEP_STATUS_ICON[nodeInstallStatus[item.name]] : undefined
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
    npmDependencyDispatchers.getGlobalDependenciesInfo();
  }, []);

  useEffect(() => {
    if (npmDependencyEffectsState.getGlobalDependenciesInfo.error) {
      Message.error(npmDependencyEffectsState.getGlobalDependenciesInfo.error.message);
    }
  }, [npmDependencyEffectsState.getGlobalDependenciesInfo.error]);

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
      <CustomGlobalDepsPathDialog />
    </div>
  );
};

export default NodeInstaller;
