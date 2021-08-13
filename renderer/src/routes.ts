import { lazy } from 'ice';
import BasicLayout from '@/layouts/BasicLayout';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Node = lazy(() => import('@/pages/Node'));
const Git = lazy(() => import('@/pages/Git'));
const Application = lazy(() => import('@/pages/Application'));

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
