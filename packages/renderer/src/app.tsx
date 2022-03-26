import type { IAppConfig } from 'ice';
import { runApp } from 'ice';

const appConfig: IAppConfig = {
  app: {
    rootId: 'ice-container',
  },
  router: {
    type: 'hash',
  },
};

runApp(appConfig);
