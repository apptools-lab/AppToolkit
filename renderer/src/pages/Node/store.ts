import { createStore, IStoreModels } from 'ice';
import nodeVersionModel from './models/nodeVersion';
import npmRegistryModel from './models/npmRegistry';
import npmDependencyModel from './models/npmDependency';

interface IModels extends IStoreModels {
  nodeVersion: typeof nodeVersionModel;
  npmRegistry: typeof npmRegistryModel;
  npmDependency: typeof npmDependencyModel;
}

const models: IModels = {
  nodeVersion: nodeVersionModel,
  npmRegistry: npmRegistryModel,
  npmDependency: npmDependencyModel,
};

export default createStore(models);
