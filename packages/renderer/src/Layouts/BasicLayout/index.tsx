import ProLayout from '@ant-design/pro-layout';
import { NavLink } from 'ice';
import { useState } from 'react';
import { asideMenuConfig } from './menuConfig';
import logo from '@/assets/logo.png';
import styles from './index.module.scss';

export default function BasicLayout({ children, location }) {
  const platform = window.electronAPI.getPlatform();
  const win32 = platform === 'win32';
  return (
    <ProLayout
      title={false}
      logo={false}
      style={{ minHeight: '100vh' }}
      navTheme="light"
      location={{ pathname: location.pathname }}
      fixSiderbar
      fixedHeader
      headerRender={win32 ? () => <WinLayoutHeader /> : () => <MacLayoutHeader />}
      menuRender={() => <MenuRender win32={win32} />}
      menu={{ defaultOpenAll: true }}
      collapsed={false}
      collapsedButtonRender={false}
      siderWidth={180}
      contentStyle={{ height: 'calc(100vh - 48px)', marginLeft: 180 }}
    >
      {children}
    </ProLayout>
  );
}

function MacLayoutHeader() {
  return (
    <div className={styles.layout_header}>
      <Logo />
    </div>
  );
}
function WinLayoutHeader() {
  const setMin = () => {
    window.electronAPI.setMin();
  };
  const [isMax, setIsMax] = useState(false);
  const setMax = () => {
    setIsMax(window.electronAPI.setMax());
  };
  const setClose = () => {
    window.electronAPI.setClose();
  };
  return (
    <div className={styles.win_header}>
      <div className={styles.selection}>
        <div className={styles.svg} onClick={setMin}><svg t="1649918204011" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9793" width="16" height="16"><path d="M928 544H96c-17.673 0-32-14.327-32-32 0-17.673 14.327-32 32-32h832c17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32z" p-id="9794" fill="#707070" /></svg></div>
        <div className={styles.svg} onClick={setMax}>
          {!isMax && <svg t="1649918149245" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9309" width="16" height="16"><path d="M800 928H224c-70.692 0-128-57.308-128-128V224c0-70.692 57.308-128 128-128h576c70.692 0 128 57.308 128 128v576c0 70.692-57.308 128-128 128z m64-704c0-35.346-28.654-64-64-64H224c-35.346 0-64 28.654-64 64v576c0 35.346 28.654 64 64 64h576c35.346 0 64-28.654 64-64V224z" p-id="9310" fill="#707070" /></svg>}
          {isMax && <svg t="1649917974933" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8143" width="16" height="16"><path d="M832 704H704v128c0 70.692-57.308 128-128 128H192c-70.692 0-128-57.308-128-128V448c0-70.692 57.308-128 128-128h128V192c0-70.692 57.308-128 128-128h384c70.692 0 128 57.308 128 128v384c0 70.692-57.308 128-128 128zM192 384c-35.346 0-64 28.654-64 64v384c0 35.346 28.654 64 64 64h384c35.346 0 64-28.654 64-64V448c0-35.346-28.654-64-64-64H192z m704-192c0-35.346-28.654-64-64-64H448c-35.346 0-64 28.654-64 64v128h192c70.692 0 128 57.308 128 128v192h128c35.346 0 64-28.654 64-64V192z" p-id="8144" fill="#707070" /></svg>}
        </div>
        <div className={styles.svg_close} onClick={setClose}><svg t="1649918273567" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10175" width="16" height="16"><path d="M557.327 512l361.29 361.29c12.517 12.517 12.517 32.81 0 45.327-12.517 12.517-32.81 12.517-45.327 0L512 557.327l-361.29 361.29c-12.517 12.517-32.81 12.517-45.327 0-12.517-12.517-12.517-32.81 0-45.327L466.673 512l-361.29-361.29c-12.517-12.517-12.517-32.81 0-45.327 12.517-12.517 32.81-12.517 45.327 0L512 466.673l361.29-361.29c12.517-12.517 32.81-12.517 45.327 0 12.517 12.517 12.517 32.81 0 45.327L557.327 512z" p-id="10176" fill="#707070" /></svg></div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className={styles.logoPlaceholder}>
      <img
        style={{ height: 18 }}
        src={logo}
        alt="logo"
      />
      <div className={styles.logo_text}>AppToolkit</div>
    </div>
  );
}

function MenuRender({ win32 = false }: { win32: boolean }) {
  const [rotate, setRotate] = useState(false);
  return (
    <div className={styles.menu}>
      {win32 ? <Logo /> : <div className={styles.logoPlaceholder} />}
      {asideMenuConfig.map((item) => {
        if (Array.isArray(item.routes)) {
          return (
            <>
              <NavLink to="/env" activeClassName={styles.link_active} className={styles.link} exact onClick={() => setRotate(!rotate)}>
                <div className={styles.link_icon}>{item.icon}</div>{item.name}
                <svg className={styles.drop} style={rotate ? { transform: 'rotate(180deg)' } : undefined} t="1649934439347" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="35038" width="20" height="20"><path d="M217.6 311.808l384.512 384.512-90.624 90.624-384.512-384.512 90.624-90.624z" fill="#FC634F" p-id="35039" /><path d="M896.512 401.92L512 786.432 420.864 696.32l384.512-384.512 91.136 90.112z" fill="#FC634F" p-id="35040" /></svg>
              </NavLink>
              {rotate && item.routes.map((route) => {
                return (
                  <NavLink to={route.path} className={styles.sub_link} activeClassName={styles.link_active} exact>
                    <div className={styles.link_icon}>{route.icon}</div>{route.name}
                  </NavLink>
                );
              })}
            </>
          );
        }
        return (
          <NavLink to={item.path} className={styles.link} activeClassName={styles.link_active} exact>
            <div className={styles.link_icon}>{item.icon}</div>{item.name}
          </NavLink>
        );
      })}
    </div>
  );
}