import getBasePackagesInfo from './getBasePackagesInfo';
import installBasePackages from './installBasePackages';
import getNodeInfo from './getNodeInfo';
import installNode from './installNode';
import handleGitConfig from './handleGitConfig';

export default () => {
  getBasePackagesInfo();

  installBasePackages();

  getNodeInfo();

  installNode();

  handleGitConfig();
};
