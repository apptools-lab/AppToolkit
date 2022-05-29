import type { FC } from 'react';
import { Row, Col } from 'antd';
import styles from './index.module.scss';

const data = [
  {
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN012cOEYH1QgKmtKX8Ju_!!6000000002005-2-tps-200-200.png',
    description: '分布式版本控制软件',
    id: 'git',
    name: 'Git',
  },
  {
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN01jRdeW91kg8w2eH4YR_!!6000000004712-0-tps-225-225.jpg',
    description: '强大、快速的网页浏览器',
    id: 'Google Chrome',
    name: 'Google Chrome',
  },
  {
    icon: 'https://img.alicdn.com/imgextra/i4/O1CN01Jujm911lApTQ1ghkF_!!6000000004779-0-tps-225-225.jpg',
    description: '跨平台、轻量的代码编辑器',
    id: 'Visual Studio Code',
    name: 'Visual Studio Code',
  },
];

const Recommendation: FC = () => {
  return (
    <div className={styles.recommendation}>
      <div className={styles.title}>为你精选</div>
      <div className={styles.infoList}>
        <Row>
          {data.map(({ icon, id, name, description }) => (
            <Col xs={{ span: 12 }} lg={{ span: 8 }} key={id} className={styles.info}>
              <img src={icon} alt="icon" />
              <div className={styles.description}>
                <div>{name}</div>
                <div>{description}</div>
              </div>
            </Col>
          ))}

        </Row>
      </div>
    </div>
  );
};

export default Recommendation;
