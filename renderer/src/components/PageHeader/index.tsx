import React, { FC } from 'react';
import cn from 'classnames';
import styles from './index.module.scss';

interface PageHeaderProps {
  title: string;
  button?: React.ReactNode;
  sticky?: boolean;
}

const PageHeader: FC<PageHeaderProps> = ({ title, button = null, sticky = false }) => {
  return (
    <div className={cn(styles.header, { [styles.sticky]: sticky })}>
      <div className={styles.title}>{title}</div>
      <div className={styles.btn}>{button}</div>
    </div>
  );
};

export default PageHeader;
