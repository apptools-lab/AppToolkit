import { useEffect } from 'react';
import { Grid, Select, Message, Icon, Balloon } from '@alifd/next';
import store from '../../store';
import styles from './index.module.scss';

const { Row, Col } = Grid;
const { Tooltip } = Balloon;

function NpmRegistry() {
  const [state, dispatchers] = store.useModel('npmRegistry');
  const { npmInstalled, currentNpmRegistry, allNpmRegistries, isAliInternal } = state;
  const effectsState = store.useModelEffectsState('npmRegistry');
  const effectsErrors = store.useModelEffectsError('npmRegistry');

  useEffect(() => {
    dispatchers.checkIsAliInternal();
  }, []);

  useEffect(() => {
    dispatchers.checkNpmInstalled();
  }, []);

  useEffect(() => {
    if (npmInstalled) {
      dispatchers.getAllNpmRegistries();
      dispatchers.getCurrentNpmRegistry();
    }
  }, [npmInstalled]);

  const onChange = async (registry: string) => {
    await dispatchers.setCurrentNpmRegistry(registry);
    Message.success(`设置镜像源地址 ${registry} 成功`);
  };

  useEffect(() => {
    if (effectsErrors.checkNpmInstalled.error) {
      Message.error(effectsErrors.checkNpmInstalled.error.message);
    }
  }, [effectsErrors.checkNpmInstalled.error]);

  useEffect(() => {
    if (effectsErrors.getAllNpmRegistries.error) {
      Message.error(effectsErrors.getAllNpmRegistries.error.message);
    }
  }, [effectsErrors.getAllNpmRegistries.error]);

  useEffect(() => {
    if (effectsErrors.getCurrentNpmRegistry.error) {
      Message.error(effectsErrors.getCurrentNpmRegistry.error.message);
    }
  }, [effectsErrors.getCurrentNpmRegistry.error]);

  useEffect(() => {
    if (effectsErrors.setCurrentNpmRegistry.error) {
      Message.error(effectsErrors.setCurrentNpmRegistry.error.message);
    }
  }, [effectsErrors.setCurrentNpmRegistry.error]);

  const selectItemRender = (item) => {
    return (
      <div className={styles.selectItemRender}>
        <span>{item.label}</span>
        <>
          {item.recommended &&
            <img src="https://img.alicdn.com/imgextra/i1/O1CN016h0vOh1W0YLcwNuAf_!!6000000002726-55-tps-32-32.svg" alt="recommendIcon" />
          }
        </>
      </div>
    );
  };

  if (isAliInternal) {
    return null;
  }

  return (
    <Row className={styles.row}>
      <Col span={10}>
        <div className={styles.subTitle}>
          全局 npm 镜像源
          <Tooltip
            trigger={<Icon type="prompt" className={styles.promptIcon} />}
            align="t"
            delay={200}
          >
            如果有发 npm 包的需求，请先切换至 npm 官方镜像源。
          </Tooltip>
        </div>
      </Col>
      <Col span={14}>
        <Select
          disabled={!npmInstalled}
          className={styles.select}
          value={currentNpmRegistry}
          onChange={onChange}
          dataSource={allNpmRegistries}
          itemRender={selectItemRender}
          state={effectsState.setCurrentNpmRegistry.isLoading ? 'loading' : undefined}
        />
      </Col>
    </Row>
  );
}

export default NpmRegistry;
