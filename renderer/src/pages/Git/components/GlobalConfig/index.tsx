import { FC, useEffect } from 'react';
import { Field, Message } from '@alifd/next';
import debounce from 'lodash.debounce';
import BaseConfig from '../BaseConfig';
import store from '../../store';
import styles from './index.module.scss';

const GlobalConfig: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('git');
  const effectsState = store.useModelEffectsState('git');

  const { globalGitConfig } = state;

  const onFieldChange = debounce(async () => {
    const values: any = field.getValues();
    await dispatcher.setGlobalGitConfig(values);
    Message.success('设置全局 Git 配置成功');
  }, 800);

  const field = Field.useField({
    parseName: true,
    onChange: onFieldChange,
  });

  useEffect(() => {
    if (effectsState.getGlobalGitConfig.error) {
      Message.error(effectsState.getGlobalGitConfig.error.message);
    }
  }, [effectsState.getGlobalGitConfig.error]);

  useEffect(() => {
    if (effectsState.setGlobalGitConfig.error) {
      Message.error(effectsState.setGlobalGitConfig.error.message);
    }
  }, [effectsState.setGlobalGitConfig.error]);


  useEffect(() => {
    dispatcher.getGlobalGitConfig();
  }, []);

  useEffect(() => {
    field.setValues(globalGitConfig);
  }, [globalGitConfig]);
  return (
    <div className={styles.container}>
      <div className={styles.title}>全局配置</div>
      <BaseConfig field={field} />
    </div>
  );
};

export default GlobalConfig;
