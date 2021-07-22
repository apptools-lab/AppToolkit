import { Button, Box, Typography, Tag, List } from '@alifd/next';
import store from '../../store';
import styles from './index.module.scss';

const { Group: TagGroup } = Tag;

const InstallResult = ({ goBack, reinstallGlobalDeps }) => {
  const [state] = store.useModel('nodeVersion');
  const { nodeInstallStatus, installResult, nodeInstallErrMsg } = state;

  const successTag = <Tag type="normal" color="green" size="medium">成功</Tag>;
  const errorTag = <Tag type="normal" color="red" size="medium">失败</Tag>;

  return (
    <Box align="center">
      <Typography.H1>安装结果</Typography.H1>
      <List size="medium">
        {/* Node.js install result */}
        <List.Item
          title="安装 Node.js"
          extra={<TagGroup>{nodeInstallStatus.installNode === 'success' ? successTag : errorTag}</TagGroup>}
        >
          {nodeInstallStatus.installNode === 'success' && (
            <>
              <div className={styles.text}>新建终端，输入以下命令，以验证 Node.js 是否安装成功：</div>
              <code className={styles.code}>
                $ node --version
                <br />
                {installResult.nodeVersion && <># {installResult.nodeVersion}</>}
                <br />
                $ npm --version
                <br />
                {installResult.npmVersion && <># {installResult.npmVersion}</>}
              </code>
            </>
          )}
          {nodeInstallStatus.installNode === 'error' && (
            <>
              <div className={styles.text}>错误信息：</div>
              <code className={styles.code}>
                {nodeInstallErrMsg.installNode}
              </code>
            </>
          )}
        </List.Item>
        {/* npm package install result */}
        {reinstallGlobalDeps && (
          <List.Item
            title="重装全局依赖"
            extra={<TagGroup>{nodeInstallStatus.reinstallDependencies === 'success' ? successTag : errorTag}</TagGroup>}
          >
            {nodeInstallStatus.reinstallDependencies === 'error' && (
              <>
                <div className={styles.text}>重装全局依赖失败，请自行安装依赖。详细日志如下：</div>
                <code className={styles.code}>
                  {nodeInstallErrMsg.reinstallDependencies}
                </code>
              </>
            )}
          </List.Item>
        )}
      </List>
      <Box margin={40} direction="row">
        <Button type="primary" style={{ marginRight: '5px' }} onClick={goBack}>
          返回
        </Button>
      </Box>
    </Box>
  );
};

export default InstallResult;
