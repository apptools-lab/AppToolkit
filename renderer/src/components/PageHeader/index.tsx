import React, { FC } from 'React';
import styles from './index.module.scss';

interface IPageHeader {
  title: string;
  button?: React.ReactNode;
}

const PageHeader: FC<IPageHeader> = ({ title, button }) => {
  return (
    <div className={styles.head}>
      <span className={styles.title}>{title}</span>
      {button}
    </div>
  );
};

export default PageHeader;
