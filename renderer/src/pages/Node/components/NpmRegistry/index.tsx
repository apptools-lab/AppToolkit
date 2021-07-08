import { useEffect } from 'react';
import { Grid, Select, Message } from '@alifd/next';
import store from '../../store';
import styles from './index.module.scss';

const { Row, Col } = Grid;

function NpmRegistry() {
  const [state, dispatchers] = store.useModel('node');
  const { npmInstalled, currentNpmRegistry, allNpmRegistries } = state;
  const effectsState = store.useModelEffectsState('node');
  const effectsErrors = store.useModelEffectsError('node');

  useEffect(() => {
    dispatchers.checkNpmInstalled();
  }, []);

  useEffect(() => {
    if (npmInstalled) {
      dispatchers.getAllNpmRegistries();
      dispatchers.getCurrentNpmRegistry();
    }
  }, [npmInstalled]);

  const onChange = (registry: string) => {
    dispatchers.setCurrentNpmRegistry(registry);
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
  return (
    <Row className={styles.row}>
      <Col span={12}>
        <div className={styles.subTitle}>npm 镜像源</div>
      </Col>
      <Col span={12}>
        <Select
          disabled={!npmInstalled}
          className={styles.select}
          value={currentNpmRegistry}
          onChange={onChange}
          dataSource={allNpmRegistries}
          state={effectsState.setCurrentNpmRegistry.isLoading ? 'loading' : undefined}
        />
      </Col>
    </Row>
  );
}

export default NpmRegistry;
