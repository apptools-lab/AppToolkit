import { FC, useEffect } from 'react';
import { Field, Message } from '@alifd/next';
import debounce from 'lodash.debounce';
import removeObjEmptyValue from '@/utils/removeObjEmptyValue';
import BaseGitConfig from '../BaseGitConfig';
import store from '../../store';
import styles from './index.module.scss';

const GlobalGitConfig: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('git');
  const effectsState = store.useModelEffectsState('git');

  const { globalGitConfig } = state;

  const onFieldChange = debounce(async () => {
    const values: any = field.getValues();
    await dispatcher.updateGlobalGitConfig(removeObjEmptyValue(values));
    Message.success('更新全局 Git 配置成功');
  }, 800);

  const field = Field.useField({
    parseName: true,
    onChange: onFieldChange,
    autoUnmount: false,
  });

  useEffect(() => {
    dispatcher.getGlobalGitConfig();
  }, []);

  useEffect(() => {
    if (effectsState.getGlobalGitConfig.error) {
      Message.error(effectsState.getGlobalGitConfig.error.message);
    }
  }, [effectsState.getGlobalGitConfig.error]);

  useEffect(() => {
    if (effectsState.updateGlobalGitConfig.error) {
      Message.error(effectsState.updateGlobalGitConfig.error.message);
    }
  }, [effectsState.updateGlobalGitConfig.error]);

  useEffect(() => {
    field.setValues(globalGitConfig);
  }, [globalGitConfig]);
  return (
    <>
      <div className={styles.title}>全局配置</div>
      <BaseGitConfig field={field} />
    </>
  );
};

export default GlobalGitConfig;
