import { createStore, IStoreModels } from 'ice';
import browserExtensionModel from './models/browserExtension';

interface IModels extends IStoreModels {
  browserExtension: typeof browserExtensionModel;
}

const models: IModels = {
  browserExtension: browserExtensionModel,

};

export default createStore(models);
