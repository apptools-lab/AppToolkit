import { FC } from 'react';
import { Field, Grid, Input, Switch } from '@alifd/next';
import styles from './index.module.scss';

const { Row, Col } = Grid;

interface IBaseGitConfig {
  field: Field;
}

const BaseGitConfig: FC<IBaseGitConfig> = ({ field }) => {
  const { init } = field;
  return (
    <>
      <Row align="center" className={styles.row}>
        <Col span={10} className={styles.label}>用户名</Col>
        <Col span={14}>
          <Input {...init('user.name', { initValue: '' })} className={styles.input} />
        </Col>
      </Row>
      <Row align="center" className={styles.row}>
        <Col span={10} className={styles.label}>邮箱</Col>
        <Col span={14}>
          <Input {...init('user.email', { initValue: '' })} className={styles.input} />
        </Col>
      </Row>
      <Row align="center" className={styles.row}>
        <Col span={10} className={styles.label}>忽略文件名大小写</Col>
        <Col span={14}>
          <Switch {...init('core.ignoreCase', { valueName: 'checked', initValue: false })} />
        </Col>
      </Row>
    </>
  );
};

export default BaseGitConfig;
