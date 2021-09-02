import classnames from 'classnames';
import styles from './index.module.scss';

interface IAppCard {
  title: string;
  description: string;
  icon: string;
  link: string;
  recommended?: boolean;
  showSplitLine?: boolean;
  operation?: React.ReactNode | null;
}

const AppCard: React.FC<IAppCard> = ({
  title,
  description,
  icon,
  link,
  recommended,
  operation = null,
  showSplitLine = true,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <a href={link} target="_blank" rel="noreferrer">
          <img src={icon} alt="appIcon" />
        </a>
      </div>
      <div className={classnames(styles.right, { [styles.splitLine]: showSplitLine })}>
        <div className={styles.title}>
          <a href={link} target="_blank" rel="noreferrer">{title}</a>
          {recommended &&
            <img src="https://img.alicdn.com/imgextra/i1/O1CN016h0vOh1W0YLcwNuAf_!!6000000002726-55-tps-32-32.svg" alt="recommendIcon" />
          }
        </div>
        <div className={styles.desc}>{description}</div>
        <div className={styles.operation}>
          {operation}
        </div>
      </div>
    </div>
  );
};

export default AppCard;
