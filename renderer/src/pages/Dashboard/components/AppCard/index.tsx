import classnames from 'classnames';
import { Icon, Balloon } from '@alifd/next';
import { VersionStatus } from '@/interfaces';
import styles from './index.module.scss';

interface IAppCard {
  name: string;
  description: string;
  icon: string;
  link: string;
  recommended?: boolean;
  versionStatus: keyof typeof VersionStatus;
  showSplitLine?: boolean;
  warningMessage?: string;
}

const AppCard: React.FC<IAppCard> = ({
  name,
  description,
  icon,
  link,
  recommended,
  versionStatus,
  showSplitLine = true,
  warningMessage = '',
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <a href={link} target="__blank">
          <img src={icon} alt="appIcon" />
        </a>
      </div>
      <div className={classnames(styles.right, { [styles.splitLine]: showSplitLine })}>
        <div className={styles.title}>
          <a href={link} target="__blank">{name}</a>
          {recommended &&
            <img src="https://img.alicdn.com/imgextra/i1/O1CN016h0vOh1W0YLcwNuAf_!!6000000002726-55-tps-32-32.svg" alt="recommendIcon" />
          }
        </div>
        <div className={styles.desc}>{description}</div>
        <div
          className={classnames(styles.status, { [styles.availableStatus]: versionStatus !== 'installed' })}
        >
          {VersionStatus[versionStatus]}
          {warningMessage && (
            <Balloon trigger={<Icon type="warning" />} closable={false}>
              {warningMessage}
            </Balloon>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppCard;
