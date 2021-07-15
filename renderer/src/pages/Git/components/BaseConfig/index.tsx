import { FC } from 'react';
import { Field, Grid, Input, Switch } from '@alifd/next';
import styles from './index.module.scss';

const { Row, Col } = Grid;

interface IBaseConfig {
  field: Field;
}

const BaseConfig: FC<IBaseConfig> = ({ field }) => {
  const { init } = field;

  return (
    <>
      <Row align="center" className={styles.row}>
        <Col span={12} className={styles.label}>用户名</Col>
        <Col span={12}>
          <Input {...init('user.name')} className={styles.input} />
        </Col>
      </Row>
      <Row align="center" className={styles.row}>
        <Col span={12} className={styles.label}>邮箱</Col>
        <Col span={12}>
          <Input {...init('user.email')} className={styles.input} />
        </Col>
      </Row>
      <Row align="center" className={styles.row}>
        <Col span={12} className={styles.label}>忽略文件名大小写</Col>
        <Col span={12}>
          <Switch {...init('core.ignoreCase')} />
        </Col>
      </Row>
    </>
  );
};

export default BaseConfig;
