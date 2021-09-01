import { lazy } from 'ice';
import BasicLayout from '@/layouts/BasicLayout';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Node = lazy(() => import('@/pages/Node'));
const Git = lazy(() => import('@/pages/Git'));
const Application = lazy(() => import('@/pages/Application'));
const BrowserExtension = lazy(() => import('@/pages/BrowserExtension'));

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
        path: '/browser-extension',
        exact: true,
        component: BrowserExtension,
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
