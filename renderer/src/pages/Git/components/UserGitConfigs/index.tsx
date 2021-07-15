import { FC, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { Field, Message } from '@alifd/next';
import BaseGitConfig from '../BaseGitConfig';
import store from '../../store';
import styles from './index.module.scss';

interface IUserGitConfig {
  gitDir: string;
  name: string;
  [k: string]: any;
}

const UserGitConfigs: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('git');
  const { userGitConfigs } = state;

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
  const [, dispatcher] = store.useModel('git');

  const onFieldChange = debounce(async () => {
    const values: any = field.getValues();
    await dispatcher.setUserGitConfig({ gitConfigPath, gitConfig: values });
    Message.success(`设置 ${name} Git 配置成功`);
    dispatcher.getUserGitConfigs();
  }, 800);

  const field = Field.useField({
    parseName: true,
    onChange: onFieldChange,
  });

  useEffect(() => {
    field.setValues(props);
  }, [props.length]);

  return (
    <div>
      <div className={styles.title}>{name} 配置</div>
      <BaseGitConfig field={field} />
    </div>
  );
};
export default UserGitConfigs;
