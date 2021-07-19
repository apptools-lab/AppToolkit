import { useEffect, FC } from 'react';
import { Message } from '@alifd/next';
import store from '../../store';
import UserGitConfig, { IUserGitConfig } from '../UserGitConfig';

const UserGitConfigList: FC<{}> = () => {
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
    <>
      {userGitConfigs.map((userGitConfig: IUserGitConfig) => {
        return (
          <UserGitConfig key={userGitConfig.configName} {...userGitConfig} />
        );
      })}
    </>
  );
};

export default UserGitConfigList;
