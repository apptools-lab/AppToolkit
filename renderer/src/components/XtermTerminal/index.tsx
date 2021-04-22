import { useRef, useEffect, FC } from 'react';
import debounce from 'lodash.debounce';
import Icon from '@/components/Icon';
import xtermManager from '@/utils/xtermManager';
import 'xterm/css/xterm.css';
import styles from './index.module.scss';

interface IXtermTerminal {
  id: string;
  name?: string;
  options?: object;
}

const XtermTerminal: FC<IXtermTerminal> = ({ id, name, options }) => {
  const xtermRef = useRef(id);

  useEffect(() => {
    // current terminal instance
    const currentTerm = xtermManager.create(id, xtermRef.current, options);
    if (!currentTerm.inited) {
      currentTerm.inited = true;

      if (name) {
        currentTerm.writeChunk(`${name}\x1B[0m `);
      }
    }

    const handleResize = debounce(() => { currentTerm.fitAddon.fit(); }, 500);
    // listen reszie
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const term = xtermManager.getTerm(id);

  return (
    <div className={styles.xtermContainer}>
      <Icon
        type="clear"
        className={styles.clearIcon}
        onClick={() => term.clear(id)}
      />
      <div ref={xtermRef} className={styles.xtermRef} />
    </div>
  );
};

export default XtermTerminal;
