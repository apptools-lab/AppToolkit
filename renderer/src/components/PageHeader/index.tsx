import React, { FC } from 'react';
import { useInView } from 'react-intersection-observer';
import styles from './index.module.scss';

interface PageHeaderProps {
  title: string;
  button?: React.ReactNode;
  sticky?: boolean;
}

const PageHeader: FC<PageHeaderProps> = ({ title, button = null }) => {
  const { ref, inView } = useInView({
    threshold: 0,
  });
  const headerContent = (
    <>
      <div className={styles.title}>{title}</div>
      <div className={styles.btn}>{button}</div>
    </>
  );
  return (
    <>
      <div ref={ref} className={styles.header}>
        {headerContent}
      </div>
      {!inView && (
        <div className={styles.stickyHeader}>
          {headerContent}
        </div>
      )}
    </>
  );
};

export default PageHeader;
