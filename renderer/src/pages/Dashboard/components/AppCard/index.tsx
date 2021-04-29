import classnames from 'classnames';
import { Icon, Balloon } from '@alifd/next';
import { IAppCard, VersionStatus } from '@/interfaces';
import styles from './index.module.scss';

const AppCard: React.FC<IAppCard> = ({
  name,
  description,
  icon,
  recommended,
  versionStatus,
  showSplitLine = true,
  wanringMessage = '',
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <img src={icon} alt="appIcon" />
      </div>
      <div className={classnames(styles.right, { [styles.splitLine]: showSplitLine })}>
        <div className={styles.title}>
          <span>{name}</span>
          {recommended &&
            <img src="https://img.alicdn.com/imgextra/i1/O1CN016h0vOh1W0YLcwNuAf_!!6000000002726-55-tps-32-32.svg" alt="recommendIcon" />
          }
        </div>
        <div className={styles.desc}>{description}</div>
        <div
          className={classnames(styles.status, { [styles.availableStatus]: versionStatus !== 'installed' })}
        >
          {VersionStatus[versionStatus]}
          {wanringMessage && (
            <Balloon trigger={<Icon type="warning" />} closable={false}>
              {wanringMessage}
            </Balloon>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppCard;
