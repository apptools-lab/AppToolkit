import { Button, Box, Icon, Typography } from '@alifd/next';
import store from '../../store';
import styles from './index.module.scss';

const InstallResult = ({ goBack }) => {
  const [state] = store.useModel('node');
  const { installStatus, installResult, installErrMsg } = state;

  return (
    <Box align="center">
      {
        (installErrMsg.installNode || installErrMsg.reinstallPackages) ? (
          <>
            <img src="https://img.alicdn.com/tfs/TB1VOSVoqL7gK0jSZFBXXXZZpXa-72-72.png" alt="img" />
            <Typography.H1>安装失败</Typography.H1>
            <Typography.H3>错误信息</Typography.H3>
            {
              Object.keys(installErrMsg).map((key: string) => {
                return installErrMsg[key] ? <Typography.Text>{installErrMsg[key]}</Typography.Text> : null;
              })
            }
          </>
        ) : (
          <>
            <Icon type="success-filling" size={72} className={styles.successIcon} />
            <Typography.H1>安装成功</Typography.H1>
            {installStatus.installNode === 'success' && (
              <>
                <Typography.Text className={styles.text}>新建终端，输入以下命令，以验证 Node.js 是否安装成功：</Typography.Text>
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
          </>
        )
      }
      <Box margin={40} direction="row">
        <Button type="primary" style={{ marginRight: '5px' }} onClick={goBack}>
          返回
        </Button>
      </Box>
    </Box>
  );
};

export default InstallResult;
