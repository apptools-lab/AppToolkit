import getBasePackagesInfo from './getBasePackagesInfo';
import installBasePackages from './installBasePackages';
import getNodeInfo from './getNodeInfo';
import installNode from './installNode';
import handleGitConfig from './handleGitConfig';
import getFolderPath from './getFolderPath';

export default () => {
  getBasePackagesInfo();

  installBasePackages();

  getNodeInfo();

  installNode();

  handleGitConfig();

  getFolderPath();
};
