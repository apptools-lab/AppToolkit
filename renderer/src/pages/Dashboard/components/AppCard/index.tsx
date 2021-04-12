import { IAppCard } from '@/interfaces/dashboard';
import styles from './index.module.scss';

const AppCard: React.FC<IAppCard> = ({ name, description, imgUrl, recommended }) => {
  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <img src={imgUrl} alt="" />
      </div>
      <div className={styles.right}>
        <div className={styles.name}>{name}</div>
        <div className={styles.description}>{description}</div>
        <div className={styles.status}>未安装</div>
      </div>
    </div>
  );
};

export default AppCard;
