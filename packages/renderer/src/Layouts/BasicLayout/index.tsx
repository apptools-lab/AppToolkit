import ProLayout from '@ant-design/pro-layout';
import { Link } from 'ice';
import { asideMenuConfig } from './menuConfig';
import logo from '@/assets/logo.png';

export default function BasicLayout({ children, location }) {
  const platform = window.electronAPI.getPlatform();
  const isWin32 = platform === 'win32';
  return (
    <ProLayout
      title={false}
      logo={false}
      style={{
        minHeight: '100vh',
      }}
      navTheme="light"
      location={{
        pathname: location.pathname,
      }}
      fixSiderbar
      fixedHeader
      menuHeaderRender={isWin32 ? () => <Logo /> : undefined}
      headerRender={isWin32 ? false : () => <LayoutHeader />}
      menuDataRender={() => asideMenuConfig}
      menuItemRender={(item, element) => {
        if (!item.path) {
          return element;
        }
        return <Link to={item.path}>{element}</Link>;
      }}
      menu={{
        defaultOpenAll: true,
      }}
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingRight: 20,
      }}
    >
      <Logo />
    </div>
  );
}

function Logo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 48,
        lineHeight: 48,
      }}
    >
      <img
        style={{
          height: 18,

        }}
        src={logo}
        alt="logo"
      />
      <div
        style={{
          marginLeft: 6,
          fontWeight: 500,
          fontSize: 18,
          color: '#4A4848',
        }}
      >
        AppToolkit
      </div>
    </div>
  );
}