import { useEffect, FC } from 'react';
import { Message, Collapse, Button, Dialog } from '@alifd/next';
import Icon from '@/components/Icon';
import store from '../../../store';
import UserGitConfig from '../UserGitConfig';
import UserGitConfigDialogForm from '../UserGitConfigDialogForm';
import styles from './index.module.scss';

const { Panel } = Collapse;

const UserGitConfigList: FC<{}> = () => {
  const [state, dispatcher] = store.useModel('git');
  const effectsState = store.useModelEffectsState('git');
  const { userGitConfigs } = state;

  const refresh = async () => {
    await dispatcher.getUserGitConfigs();
    await dispatcher.getExistedUserGitConfigs();
  };

  const onRemoveUserGitConfig = (configName: string, gitDirs: string[]) => {
    Dialog.confirm({
      title: '提示',
      content: `是否删除 ${configName} 配置？`,
      onOk: async () => {
        const res = await dispatcher.removeUserGitConfig({ configName, gitDirs });
        if (res) {
          Message.success(`删除 ${configName} Git 配置成功`);
          await refresh();
        }
      },
    });
  };
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
      <div className={styles.header}>
        <div className={styles.title}>用户配置</div>
        <Button
          type="primary"
          onClick={() => {
            dispatcher.setUserGitConfigFormVisible(true);
          }}
        >
          新增配置
        </Button>
      </div>
      {
        !!userGitConfigs.length && (
          <Collapse defaultExpandedKeys={Array.from({ length: userGitConfigs.length }).map((item, index) => String(index))}>
            {userGitConfigs.map((userGitConfig, index) => {
              const { configName, gitDirs } = userGitConfig;
              const title = (
                <div className={styles.panelHeader}>
                  <div className={styles.title}>配置 - {configName}</div>
                  <Icon type="trash" className={styles.removeIcon} onClick={() => onRemoveUserGitConfig(configName, gitDirs)} />
                </div>
              );
              return (
                <Panel title={title} key={String(index)}>
                  <UserGitConfig {...userGitConfig} refresh={refresh} />
                </Panel>
              );
            })}
          </Collapse>
        )}
      <UserGitConfigDialogForm refresh={refresh} />
    </>
  );
};

export default UserGitConfigList;
