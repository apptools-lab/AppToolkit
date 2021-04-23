import { FC, useState } from 'react';
import { IBasePackage } from '@/interfaces/dashboard';
import { Dialog, Checkbox } from '@alifd/next';

interface IInstallConfirmDialog {
  packages: IBasePackage[];
  onCancel: () => void;
  onOk: (value: string[]) => void;
}

const InstallConfirmDialog: FC<IInstallConfirmDialog> = ({ packages, onCancel, onOk }) => {
  const [selectedPackages, setSelectedPackages] = useState(() => {
    const initialState = packages.map((item) => { return item.name; });
    return initialState;
  });

  const onSelectedPackagesChange = (values: string[]) => {
    setSelectedPackages(values);
  };
  return (
    <Dialog
      title="是否继续安装以下工具"
      onCancel={onCancel}
      onOk={() => onOk(selectedPackages)}
      visible
      style={{ minWidth: 400 }}
    >
      <Checkbox.Group direction="ver" value={selectedPackages} onChange={onSelectedPackagesChange}>
        {
          packages.map((item) => (
            <Checkbox value={item.name} key={item.name}>{item.title}</Checkbox>
          ))
        }
      </Checkbox.Group>
    </Dialog>
  );
};

export default InstallConfirmDialog;
