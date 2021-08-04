import React, { FC, useEffect, useState, useRef } from 'react';
import cn from 'classnames';
import styles from './index.module.scss';

interface IPageHeader {
  title: string;
  button?: React.ReactNode;
}

const PageHeader: FC<IPageHeader> = ({ title, button = null }) => {
  const headerRef = useRef(null);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (headerRef.current.offsetTop >= 40) {
        setSticky(true);
      } else {
        setSticky(false);
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div className={cn(styles.header, { [styles.sticky]: sticky })} ref={headerRef}>
      <div className={styles.title}>{title}</div>
      {button}
    </div>
  );
};

export default PageHeader;
