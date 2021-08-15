import { createStore, IStoreModels } from 'ice';
import IDEExtensionModel from './models/IDEExtension';

interface IModels extends IStoreModels {
  IDEExtension: typeof IDEExtensionModel;
}

const models: IModels = {
  IDEExtension: IDEExtensionModel,
};

export default createStore(models);
