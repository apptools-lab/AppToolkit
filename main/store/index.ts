import { TOOLKIT_TMP_DIR } from '../constants';

const Store = require('electron-store');

export const packagesDataKey = 'packagesData';
export const recordKey = 'records';

const schema = {
  [packagesDataKey]: {
    type: 'object',
    default: {},
  },
  [recordKey]: {
    type: 'object',
    default: {},
  },
};

const store = new Store({
  schema,
  name: 'database',
  cwd: TOOLKIT_TMP_DIR,
});

export default store;
