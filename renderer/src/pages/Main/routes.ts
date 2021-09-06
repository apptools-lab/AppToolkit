import { lazy } from 'ice';
import BasicLayout from '@/layouts/BasicLayout';

const Dashboard = lazy(() => import('@/pages/Main/Dashboard'));
const Node = lazy(() => import('@/pages/Main/Node'));
const Git = lazy(() => import('@/pages/Main/Git'));
const Application = lazy(() => import('@/pages/Main/Application'));
const BrowserExtension = lazy(() => import('@/pages/Main/BrowserExtension'));

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
