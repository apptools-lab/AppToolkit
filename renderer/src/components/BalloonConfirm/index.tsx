import { FC, useState } from 'react';
import { Button, Balloon, Icon } from '@alifd/next';

interface IBallonConfirm {
  title: string | React.ReactNode;
  onConfirm?: any;
  onCancel?: any;
  style?: { [k: string]: string };
  disable?: boolean;
}
const BallonConfirm: FC<IBallonConfirm> = ({
  title,
  children,
  onConfirm,
  onCancel,
  style = {},
  disable = false,
}) => {
  const [visible, setVisible] = useState(false);

  const onClick = () => {
    if (disable) {
      return;
    }
    setVisible(true);
  };

  const onClose = () => setVisible(false);

  return (
    <Balloon closable={false} trigger={<div onClick={onClick}>{children}</div>} style={style} visible={disable ? false : visible}>
      <div><Icon type="prompt" style={{ color: '#f9ca24', marginRight: 5 }} />{title}</div>
      <div style={{ marginTop: 5, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size="small"
          type="primary"
          onClick={() => {
            if (onConfirm) { onConfirm(); }
            onClose();
          }}
        >
          确定
        </Button>
        <Button
          size="small"
          onClick={() => {
            if (onCancel) { onCancel(); }
            onClose();
          }}
          style={{ marginLeft: 5 }}
        >取消
        </Button>
      </div>
    </Balloon>

  );
};

export default BallonConfirm;
