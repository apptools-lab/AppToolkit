import getBasePackagesInfo from './getBasePackagesInfo';
import installBasePackages from './installBasePackages';
import getNodeInfo from './getNodeInfo';
import installNode from './installNode';

export default () => {
  getBasePackagesInfo();
  installBasePackages();
  getNodeInfo();
  installNode();
};
