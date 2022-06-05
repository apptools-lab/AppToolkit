import type { IRouterConfig } from 'ice';
import Layout from '@/Layouts/BasicLayout';
import FrontendEnv from '@/pages/FrontendEnv';
import Git from '@/pages/Git';
import Home from '@/pages/Home';
import NotFound from '@/components/NotFound';

const routerConfig: IRouterConfig[] = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/',
        exact: true,
        component: Home,
      },
      {
        path: '/env',
        children: [
          {
            path: '/frontend',
            exact: true,
            component: FrontendEnv,
          },
        ],
      },
      {
        path: '/git',
        exact: true,
        component: Git,
      },
      {
        component: NotFound,
      },
    ],
  },
];

export default routerConfig;
