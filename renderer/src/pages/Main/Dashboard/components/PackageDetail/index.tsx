import AppDetail from '@/components/AppDetail';
import { PackageInfo } from '@/types/base';
import { Button, Icon } from '@alifd/next';
import store from '@/pages/Main/store';

const PackageDetail = ({ installPackages }) => {
  const [state, dispatchers] = store.useModel('dashboard');
  const { pkgInstallStatuses, currentPackageInfo } = state;

  function goBackFromDetailPage() {
    dispatchers.setPackageDetailVisible(false);
    dispatchers.setCurrentPackageInfo({} as any);
    dispatchers.getBasePackages();
  }

  const btnStyle = {
    fontSize: 12,
    fontWeight: 700,
    backgroundColor: '#f2f2f7',
    width: 64,
    height: 24,
    borderRadius: 10,
  };
  const Operation = ({ packageInfo }: { packageInfo: PackageInfo }) => {
    const { versionStatus } = packageInfo;
    let installStatus;

    const installStatusIndex = pkgInstallStatuses.findIndex(({ id }) => id === packageInfo.id);
    if (installStatusIndex > -1) {
      installStatus = pkgInstallStatuses[installStatusIndex].status;
    }

    const packagesList = [packageInfo];
    return (
      <>
        {
          versionStatus === 'installed' ? (
            <span style={{ color: 'gray', fontSize: 12 }}>已安装</span>
          ) : (
            <Button
              text
              type="primary"
              style={btnStyle}
              onClick={async () => {
                dispatchers.initStep(packagesList);
                await installPackages(packagesList);
              }}
            >
              {(installStatus && installStatus !== 'finish') ? <Icon type="loading" /> : '安装'}
            </Button>
          )
        }
      </>
    );
  };

  return (
    <AppDetail
      goBack={goBackFromDetailPage}
      operation={<Operation packageInfo={currentPackageInfo as PackageInfo} />}
      {...currentPackageInfo as PackageInfo}
    />
  );
};

export default PackageDetail;
