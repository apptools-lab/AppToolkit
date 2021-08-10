import BasicLayout from '@/layouts/BasicLayout';
import Dashboard from '@/pages/Dashboard';
import Node from '@/pages/Node';
import Git from '@/pages/Git';
import Application from '@/pages/Application';

const routerConfig = [
  {
    path: '/',
    component: BasicLayout,
    children: [
      {
        path: '/node',
        exact: true,
        component: Node,
      },
      {
        path: '/git',
        exact: true,
        component: Git,
      },
      {
        path: '/application',
        exact: true,
        component: Application,
      },
      {
        path: '/',
        exact: true,
        component: Dashboard,
      },
    ],
  },
];
export default routerConfig;
