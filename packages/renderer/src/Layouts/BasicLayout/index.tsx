import ProLayout from '@ant-design/pro-layout';
import { Link } from 'ice';
import { asideMenuConfig } from './menuConfig';


export default function BasicLayout({ children, location }) {
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
      headerRender={() => <LayoutHeader />}
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
    >
      <div style={{ minHeight: '60vh', background: 'white' }}>{children}</div>
    </ProLayout>
  );
}

function LayoutHeader() {
  return (
    <div >
      logo
    </div>
  );
}
