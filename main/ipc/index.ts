import getBasePackagesInfo from './getBasePackagesInfo';
import installBasePackages from './installBasePackages';

export default () => {
  getBasePackagesInfo();
  installBasePackages();
};
