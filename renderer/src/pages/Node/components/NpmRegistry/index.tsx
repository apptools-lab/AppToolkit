import { useEffect } from 'react';
import { Grid, Select, Message } from '@alifd/next';
import store from '../../store';
import styles from './index.module.scss';

const { Row, Col } = Grid;

function NpmRegistry() {
  const [state, dispatchers] = store.useModel('npmRegistry');
  const { npmInstalled, currentNpmRegistry, allNpmRegistries } = state;
  const effectsState = store.useModelEffectsState('npmRegistry');
  const effectsErrors = store.useModelEffectsError('npmRegistry');

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
  return (
    <Row className={styles.row}>
      <Col span={10}>
        <div className={styles.subTitle}>npm 镜像源</div>
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
