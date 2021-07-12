import { createStore, IStoreModels } from 'ice';
import nodeVersionModel from './models/nodeVersion';
import registryModel from './models/registry';

interface IModels extends IStoreModels {
  nodeVersion: typeof nodeVersionModel;
  registry: typeof registryModel;
}

const models: IModels = {
  nodeVersion: nodeVersionModel,
  registry: registryModel,
};

export default createStore(models);
