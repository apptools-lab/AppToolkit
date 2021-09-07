import { FC } from 'react';
import { Button, Box, Typography, List, Tag, Balloon } from '@alifd/next';
import { InstallResultData } from '@/types/base';
import styles from './index.module.scss';

const { Group: TagGroup } = Tag;

interface IInstallResult {
  goBack: any;
  result: InstallResultData[];
}

const successTag = <Tag type="normal" color="green" size="medium">成功</Tag>;
const errorTag = <Tag type="normal" color="red" size="medium">失败</Tag>;

const statusTag = {
  finish: successTag,
  error: errorTag,
};

const InstallResult: FC<IInstallResult> = ({ goBack, result }) => {
  return (
    <Box align="center">
      <Typography.H1>安装结果</Typography.H1>
      <List size="medium" className={styles.list}>
        {
          result.map((item) => (
            <List.Item key={item.title} extra={<TagGroup>{statusTag[item.status]}</TagGroup>} title={item.title}>
              {item.status === 'finish' && (
                <div className={styles.listDescription}>耗时：{Math.floor(item.duration / 1000)}秒</div>
              )}
              {item.status === 'error' && (
                <Balloon
                  triggerType="hover"
                  trigger={<div className={styles.listDescription}>错误信息：{item.errMsg}</div>}
                >
                  错误信息：{item.errMsg}
                </Balloon>
              )}
            </List.Item>
          ))
        }
      </List>
      <Box margin={20} direction="row">
        <Button type="primary" style={{ marginRight: '5px' }} onClick={goBack}>
          返回
        </Button>
      </Box>
    </Box>
  );
};

export default InstallResult;
