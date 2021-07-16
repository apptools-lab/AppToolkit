import { FC, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { Field, Message, Grid, Input, Dialog } from '@alifd/next';
import Icon from '@/components/Icon';
import removeObjEmptyValue from '@/utils/removeObjEmptyValue';
import BaseGitConfig from '../BaseGitConfig';
import store from '../../store';
import UserGitConfigDialogForm from '../UserGitConfigDialogForm';
import styles from './index.module.scss';

const { Row, Col } = Grid;

interface IUserGitConfig {
  gitDir: string;
  name: string;
  [k: string]: any;
}

const UserGitConfigs: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('git');
  const effectsState = store.useModelEffectsState('git');
  const { userGitConfigs } = state;

  useEffect(() => {
    if (effectsState.getUserGitConfigs.error) {
      Message.error(effectsState.getUserGitConfigs.error.message);
    }
  }, [effectsState.getUserGitConfigs.error]);

  useEffect(() => {
    dispatcher.getUserGitConfigs();
  }, []);
  return (
    <div>
      {
        userGitConfigs.map((userGitConfig: IUserGitConfig) => (
          <UserGitConfig key={userGitConfig.name} {...userGitConfig} />
        ))
      }
    </div>
  );
};

const UserGitConfig: FC<IUserGitConfig> = ({ name, gitDir, gitConfigPath, ...props }) => {
  const [state, dispatcher] = store.useModel('git');
  const { userGitConfigFormVisible, userGitConfigFormType } = state;
  const effectsState = store.useModelEffectsState('git');

  const onFieldChange = debounce(async () => {
    const values: any = field.getValues();
    await dispatcher.setUserGitConfig({ gitConfigPath, gitConfig: removeObjEmptyValue(values) });
    Message.success(`更新 ${name} Git 配置成功`);
    dispatcher.getUserGitConfigs();
  }, 1000);

  const field = Field.useField({
    parseName: true,
    onChange: onFieldChange,
  });

  useEffect(() => {
    if (effectsState.setUserGitConfig.error) {
      Message.error(effectsState.setUserGitConfig.error.message);
    }
  }, [effectsState.setUserGitConfig.error]);

  useEffect(() => {
    field.setValues(props);
  }, [props.length]);

  const onRemoveUserGitConfig = async () => {
    Dialog.confirm({
      title: '提示',
      content: `是否删除 ${name} 配置？`,
      onOk: async () => {
        const res = await dispatcher.removeUserGitConfig({ gitConfigPath, gitDir });
        if (res) {
          Message.success(`删除 ${name} Git 配置成功`);
          await dispatcher.getUserGitConfigs();
        }
      },
    });
  };

  const onEditUserGitConfig = async () => {
    dispatcher.setUserGitConfigFormType('edit');
    dispatcher.setUserGitConfigFormVisible(true);
  };
  return (
    <>
      <div className={styles.header}>
        <div className={styles.title}>{name} 配置</div>
        <div className={styles.operation}>
          <Icon type="bianji" className={styles.icon} onClick={onEditUserGitConfig} />
          <Icon type="trash" className={styles.icon} style={{ fontSize: 20 }} onClick={onRemoveUserGitConfig} />
        </div>
      </div>
      <Row align="center" className={styles.row}>
        <Col span={12} className={styles.label}>使用此配置的目录</Col>
        <Col span={12}>
          <Input className={styles.input} value={gitDir} readOnly />
        </Col>
      </Row>
      <BaseGitConfig field={field} />
      {userGitConfigFormType === 'edit' && (
        <UserGitConfigDialogForm
          type="edit"
          dataSource={{ name, gitDir }}
          visible={userGitConfigFormVisible}
          onSubmit={dispatcher.updateUserGitConfig}
          onVisibleChange={dispatcher.setUserGitConfigFormVisible}
        />
      )}
    </>
  );
};

export default UserGitConfigs;
