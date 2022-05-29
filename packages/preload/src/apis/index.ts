import commonApis from './common';
import gitApis from './git';
import toolApis from './tool';

export default {
  ...commonApis,
  ...gitApis,
  ...toolApis,
};
