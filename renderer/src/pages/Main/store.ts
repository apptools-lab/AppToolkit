import { createStore, IStoreModels } from 'ice';
import dashboardModel from './models/dashboard';
import applicationModel from './models/application';
import gitModel from './models/git';
import browserExtensionModel from './models/browserExtension';
import nodeVersionModel from './models/nodeVersion';
import npmRegistryModel from './models/npmRegistry';
import npmDependencyModel from './models/npmDependency';

interface IModels extends IStoreModels {
  dashboard: typeof dashboardModel;
  browserExtension: typeof browserExtensionModel;
  application: typeof applicationModel;
  git: typeof gitModel;
  nodeVersion: typeof nodeVersionModel;
  npmRegistry: typeof npmRegistryModel;
  npmDependency: typeof npmDependencyModel;
}

const models: IModels = {
  dashboard: dashboardModel,
  browserExtension: browserExtensionModel,
  git: gitModel,
  application: applicationModel,
  nodeVersion: nodeVersionModel,
  npmRegistry: npmRegistryModel,
  npmDependency: npmDependencyModel,
};

export default createStore(models);
