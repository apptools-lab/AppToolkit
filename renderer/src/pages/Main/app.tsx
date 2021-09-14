import { runApp, IAppConfig } from 'ice';
import routes from './routes';
import store from './store';

const appConfig: IAppConfig = {
  app: {
    rootId: 'ice-container',
    addProvider: ({ children }) => {
      return <store.Provider>{children}</store.Provider>;
    },
  },

  router: {
    routes,
  },
};

runApp(appConfig);
