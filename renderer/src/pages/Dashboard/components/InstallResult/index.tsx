import { Button, Icon, Box, Typography } from '@alifd/next';
import styles from './index.module.scss';

const InstallResult = ({ status, goBack, installErrMsg }) => {
  return (
    <Box align="center">
      {
        status === 'success' && (
          <>
            <Icon type="success-filling" size={72} className={styles.successIcon} />
            <Typography.H1>安装成功</Typography.H1>
          </>
        )
      }
      {
        status === 'fail' && (
          <>
            <img src="https://img.alicdn.com/tfs/TB1VOSVoqL7gK0jSZFBXXXZZpXa-72-72.png" alt="img" />
            <Typography.H1>安装失败</Typography.H1>
            {
              installErrMsg instanceof Array && (
                <>
                  {
                    installErrMsg.map((errMsg: string) => (
                      <Typography.Text key={errMsg}>{errMsg}</Typography.Text>
                    ))
                  }
                </>
              )
            }

          </>
        )
      }
      <Box margin={20} direction="row">
        <Button type="primary" style={{ marginRight: '5px' }} onClick={goBack}>
          返回
        </Button>
      </Box>
    </Box>
  );
};

export default InstallResult;
