const asideMenuConfig = [
  {
    name: '通用工具',
    path: '/main',
    routes: [
      {
        name: '首页',
        path: '/main/home',
      },
      {
        name: 'Git管理',
        path: '/main/git',
      },
      {
        name: '桌面客户端',
        path: '/main/desktop',
      },
      {
        name: '浏览器插件',
        path: '/main/browser',
      },
    ],
  },
  {
    name: '环境管理',
    path: '/env',
    routes: [
      {
        name: '前端',
        path: '/env/frontend',
      },
      {
        name: '后端',
        path: '/env/backend',
      },
      {
        name: '服务器',
        path: '/env/server',
      },
      {
        name: '移动端',
        path: '/env/mobile',
      },
      {
        name: '算法',
        path: '/env/algorithm',
      },
    ],
  },
  {
    name: '设置',
    path: '/settings',
    routes: [
      {
        name: '设置',
        path: '/settings/settings',
      },
      {
        name: '同步',
        path: '/settings/sync',
      },
    ],
  },
];

export { asideMenuConfig };
