import getBasePackagesInfo from './getBasePackagesInfo';
import installBasePackages from './installBasePackages';
import getNodeInfo from './getNodeInfo';
import installNode from './installNode';
import handleNpmRegistry from './handleNpmRegistry';
import handleNpmDependency from './handleNpmDependency';

export default () => {
  getBasePackagesInfo();

  installBasePackages();

  getNodeInfo();

  installNode();

  handleNpmRegistry();

  handleNpmDependency();
};
