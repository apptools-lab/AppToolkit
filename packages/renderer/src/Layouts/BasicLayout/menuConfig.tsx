import { SmileOutlined, HeartOutlined } from '@ant-design/icons';

const asideMenuConfig = [
  {
    name: '首页',
    path: '/',
    icon: <SmileOutlined />,
  },
  {
    name: '环境管理',
    path: '/env',
    icon: <HeartOutlined />,
    routes: [
      {
        name: '前端',
        path: '/env/frontend',
        icon: <HeartOutlined />,
      },
    ],
  },
  {
    name: 'Git',
    path: '/git',
    icon: <HeartOutlined />,
  },
];

export { asideMenuConfig };
