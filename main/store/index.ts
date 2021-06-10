import { TOOLKIT_DIR } from '../constants';
const Store = require('electron-store');

export const packagesDataKey = 'packagesData';

const schema = {
  [packagesDataKey]: {
    type: 'object',
    default: {},
  },
};

const store = new Store({
  schema,
  name: 'database',
  cwd: TOOLKIT_DIR,
});

export default store;
