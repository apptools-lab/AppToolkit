const asideMenuConfig = [
  {
    name: '首页',
    path: '/',
  },
  {
    name: '环境管理',
    path: '/env',
    routes: [
      {
        name: '前端',
        path: '/env/frontend',
      },
    ],
  },
  {
    name: 'Git 管理',
    path: '/git',
  },
];

export { asideMenuConfig };
