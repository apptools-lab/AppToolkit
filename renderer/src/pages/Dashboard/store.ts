import { createStore, IStoreModels } from 'ice';
import model from './model';

interface IAppStoreModels extends IStoreModels {
  dashboard: typeof model;
}

const appModels: IAppStoreModels = {
  dashboard: model,
};

export default createStore(appModels);
