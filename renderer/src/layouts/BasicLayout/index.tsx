import React from 'react';
import PageNav from './components/PageNav';
import styles from './index.module.scss';

export default function BasicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <div className={styles.aside}>
        <PageNav />
      </div>
      <div className={styles.main}>
        {children}
      </div>
    </div>
  );
}
