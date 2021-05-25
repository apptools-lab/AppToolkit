import { createStore, IStoreModels } from 'ice';
import model from './model';

interface IAppStoreModels extends IStoreModels {
  node: typeof model;
}

const appModels: IAppStoreModels = {
  node: model,
};

export default createStore(appModels);
