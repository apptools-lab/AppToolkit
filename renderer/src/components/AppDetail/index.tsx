import { FC, ReactNode } from 'react';
import { Icon } from '@alifd/next';
import styles from './index.module.scss';
import { PackageInfo } from '@/interfaces/base';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';

interface AppDetailProps extends PackageInfo {
  operation?: ReactNode;
  goBack?: Function;
}

const AppDetail: FC<AppDetailProps> = ({
  title,
  icon,
  description,
  operation,
  imgList,
  link,
  detail,
  goBack,
}) => {
  return (
    <div className={styles.appDetail}>
      <div className={styles.nav}>
        <Icon
          type="arrow-left"
          onClick={() => {
            goBack();
          }}
        />
      </div>
      <div className={styles.header}>
        <img src={icon} alt="icon" />
        <div className={styles.content}>
          <a href={link} target="_blank" rel="noreferrer">{title}</a>
          <div>{description}</div>
          <div>{operation || null}</div>
        </div>
      </div>
      <div className={styles.carousel}>
        {imgList && imgList.length && (
        <Carousel showIndicators={false} showStatus={false} showThumbs={false}>
          {imgList.map((img: string) => (
            <img src={img} key={img} />
          ))}
        </Carousel>
        )}
      </div>
      <div className={styles.detail}>
        {
          Array.isArray(detail) ? (
            detail.map((item) => {
              if (typeof item === 'string') {
                return <div key={item}>{item}</div>;
              } else if (typeof item === 'object') {
                return (
                  <div key={item.title}>
                    <div className={styles.title}>{item.title}</div>
                    <div className={styles.content}>{item.content}</div>
                  </div>
                );
              }
              return null;
            })
          ) : (
            <div>{detail}</div>
          )
        }
      </div>
    </div>
  );
};

export default AppDetail;
