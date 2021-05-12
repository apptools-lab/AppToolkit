import { Button, Icon, Box, Typography } from '@alifd/next';
import styles from './index.module.scss';

const InstallResult = ({ goBack }) => {
  return (
    <Box align="center">
      <Icon type="success-filling" size={72} className={styles.successIcon} />
      <Typography.H1>安装完成</Typography.H1>
      <Box margin={20} direction="row">
        <Button type="primary" style={{ marginRight: '5px' }} onClick={goBack}>
          返回
        </Button>
      </Box>
    </Box>
  );
};

export default InstallResult;
