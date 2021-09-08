import { FC, ReactNode } from 'react';
import cn from 'classnames';
import { Icon } from '@alifd/next';
import { useInView } from 'react-intersection-observer';
import styles from './index.module.scss';
import { PackageInfo } from '@/types/base';
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
  images,
  link,
  intro,
  goBack,
}) => {
  const { ref, inView } = useInView({
    threshold: 0.99,
  });

  return (
    <div className={styles.appDetail}>
      <div className={cn(styles.nav, { [styles.sticky]: !inView })}>
        <Icon
          type="arrow-left"
          onClick={() => {
            goBack();
          }}
        />
        {!inView && <div>{title}</div>}
      </div>
      <main ref={ref}>
        <div className={styles.header}>
          <img src={icon} alt="icon" />
          <div className={styles.content}>
            <a href={link} target="_blank" rel="noreferrer">{title}</a>
            <div>{description}</div>
            <div>{operation || null}</div>
          </div>
        </div>
        <div className={styles.carousel}>
          {images && images.length && (
          <Carousel showIndicators={false} showStatus={false} showThumbs={false}>
            {images.map((img: string) => (
              <img src={img} key={img} />
            ))}
          </Carousel>
          )}
        </div>
        <div className={styles.intro}>
          {
          Array.isArray(intro) ? (
            intro.map((item) => {
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
            <div>{intro}</div>
          )
        }
        </div>
      </main>

    </div>
  );
};

export default AppDetail;
