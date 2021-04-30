import classNames from 'classnames';
import { Icon } from '@alifd/next';
import styles from './index.module.scss';

const StepItemRender = (index: number, status: string) => {
  const iconType = {
    finish: 'success',
    process: 'loading',
    error: 'error',
  };

  const isWaitStatus = Object.keys(iconType).includes(status);
  return (
    <div
      className={classNames(styles.customNode, {
        [styles.activeNode]: !isWaitStatus,
      })}
    >
      {isWaitStatus ? (
        <Icon type={iconType[status]} />
      ) : (
        <span>{index + 1}</span>
      )}
    </div>
  );
};

export default StepItemRender;
