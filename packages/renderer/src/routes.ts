import type { IRouterConfig } from 'ice';
import Layout from '@/Layouts/BasicLayout';
import Dashboard from '@/pages/Dashboard';
import Home from '@/pages/Home';
import NotFound from '@/components/NotFound';

const routerConfig: IRouterConfig[] = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/dashboard',
        component: Dashboard,
      },
      {
        path: '/',
        exact: true,
        component: Home,
      },
      {
        component: NotFound,
      },
    ],
  },
];

export default routerConfig;
