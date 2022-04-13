import ProLayout from '@ant-design/pro-layout';
import { Link } from 'ice';
import { asideMenuConfig } from './menuConfig';
import logo from '@/assets/logo.png';
import styles from './index.module.scss';
import { ipcRenderer } from 'electron';

export default function BasicLayout({ children, location }) {
  const platform = window.electronAPI.getPlatform();
  const isWin32 = platform === 'win32';
  return (
    <ProLayout
      title={false}
      logo={false}
      style={{ minHeight: '100vh' }}
      navTheme="light"
      location={{ pathname: location.pathname }}
      fixSiderbar
      fixedHeader
      menuHeaderRender={isWin32 ? () => <Logo /> : undefined}
      headerRender={isWin32 ? () => <WinLayoutHeader /> : () => <LayoutHeader />}
      menuDataRender={() => asideMenuConfig}
      menuItemRender={(item, element) => {
        return <Link to={item.path || '/home'}>{element}</Link>;
      }}
      menu={{ defaultOpenAll: true }}
      collapsed={false}
      collapsedButtonRender={false}
      siderWidth={180}
      contentStyle={{ height: 'calc(100vh - 48px)' }}
    >
      {children}
    </ProLayout>
  );
}

function LayoutHeader() {
  return (
    <div className={styles.layout_header}>
      <Logo />
    </div>
  );
}
function WinLayoutHeader() {
  const setMin = () => {
    console.log('min');
    window.electronAPI.setMin();
  };
  return (
    <div className={styles.win_header}>
      <div className={styles.selection}>
        <div onClick={setMin}>最小化</div>
        <div>最大化</div>
        <div>关闭</div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className={styles.logo}>
      <img
        style={{ height: 18 }}
        src={logo}
        alt="logo"
      />
      <div className={styles.logo_text}> AppToolkit</div>
    </div>
  );
}