import { TOOLKIT_TMP_DIR } from '../constants';
const Store = require('electron-store');

export const recordKey = 'records';

const schema = {
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
