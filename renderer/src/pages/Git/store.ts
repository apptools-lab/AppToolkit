import { createStore, IStoreModels } from 'ice';
import gitModel from './models/git';
import sshModel from './models/ssh';

interface StoreModels extends IStoreModels {
  git: typeof gitModel;
  ssh: typeof sshModel;
}

const models: StoreModels = {
  git: gitModel,
  ssh: sshModel,
};

export default createStore(models);
