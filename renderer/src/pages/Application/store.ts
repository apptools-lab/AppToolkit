import { createStore, IStoreModels } from 'ice';
import applicationModel from './models/application';

interface IModels extends IStoreModels {
  application: typeof applicationModel;

}

const models: IModels = {
  application: applicationModel,

};

export default createStore(models);
