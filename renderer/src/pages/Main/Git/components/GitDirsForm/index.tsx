import { useEffect } from 'react';
import { Message, Input, Field, Grid, Button, Icon as NextIcon } from '@alifd/next';
import Icon from '@/components/Icon';
import GitDirFormItemLabel from '../GitDirFormItemLabel';
import store from '@/pages/Main/store';
import styles from './index.module.scss';

const { Row, Col } = Grid;

const GitDirsForm = ({ refresh, gitDirs = [], configName }) => {
  const [, dispatcher] = store.useModel('git');

  const field = Field.useField({
    parseName: true,
    values: {
      gitDirs: [],
    },
  });

  const getDataSource = (): Array<{ id: number; value: string}> => {
    return Array.from(field.getValue('gitDirs'));
  };

  const addItem = (value = '') => {
    const values = getDataSource();
    const index = values.length;
    field.addArrayValue('gitDirs', index, { id: index, value });
  };

  const removeItem = async (gitDir: string, index: number) => {
    field.deleteArrayValue('gitDirs', index);
    if (!gitDir) {
      return;
    }
    const res = await dispatcher.removeUserGitDir({ gitDir, configName });
    if (res) {
      Message.success('删除目录成功');
    }
  };

  const onOpenFolderDialog = async (index: number) => {
    const folderPath = await dispatcher.getFolderPath();
    if (!folderPath) {
      return;
    }
    const values = getDataSource();
    const res = await dispatcher.updateUserGitDir({
      originGitDir: values[index].value,
      currentGitDir: folderPath,
      configName,
    });
    if (res) {
      Message.success('目录更新成功');
      field.setValue(`gitDirs.${index}.value`, folderPath);
      await refresh();
    }
  };

  useEffect(() => {
    field.setValue('gitDirs', gitDirs.map((item, i) => {
      return { id: i, value: item };
    }));
  }, []);
  const dataSource = getDataSource();
  return (
    <Row className={styles.row}>
      <Col span={10} className={styles.label}><GitDirFormItemLabel /></Col>
      <Col span={14}>
        {
          dataSource.map((gitDir: any, index: number) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className={styles.gitDirRow} key={`${gitDir.value}-${index}`}>
              <Input
                {...field.init(`gitDirs.${index}.value`)}
                style={{ minWidth: '90%' }}
                readOnly
                value={gitDir.value}
                innerAfter={<Icon type="wenjianjia" className={styles.folderIcon} onClick={() => onOpenFolderDialog(index)} />}
              />
              <Icon type="minus" className={styles.minusIcon} onClick={async () => await removeItem(gitDir.value, index)} />
            </div>
          ))
        }
        <Button type="secondary" className={styles.addItemBtn} onClick={() => addItem()}>
          <NextIcon type="add" />
        </Button>
      </Col>
    </Row>
  );
};

export default GitDirsForm;
