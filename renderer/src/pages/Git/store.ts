import { createStore, IStoreModels } from 'ice';
import gitModel from './models/git';

interface StoreModels extends IStoreModels {
  git: typeof gitModel;
}

const models: StoreModels = {
  git: gitModel,
};

export default createStore(models);
