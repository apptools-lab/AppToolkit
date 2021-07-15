import BasicLayout from '@/layouts/BasicLayout';
import Dashboard from '@/pages/Dashboard';
import Node from '@/pages/Node';
import Git from '@/pages/Git';

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
        path: '/',
        exact: true,
        component: Dashboard,
      },
    ],
  },
];
export default routerConfig;
