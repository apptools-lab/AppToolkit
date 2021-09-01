import getBasePackagesInfo from './getBasePackagesInfo';
import installBasePackages from './installBasePackages';
import getNodeInfo from './getNodeInfo';
import installNode from './installNode';
import handleGitConfig from './handleGitConfig';
import getFolderPath from './getFolderPath';
import handleNpmRegistry from './handleNpmRegistry';
import handleNpmDependency from './handleNpmDependency';
import checkIsAliInternal from './checkIsAliInternal';
import handleApp from './handleApp';
import handleBrowserExtension from './handleBrowserExtension';

export default () => {
  getBasePackagesInfo();

  installBasePackages();

  getNodeInfo();

  installNode();

  handleGitConfig();

  getFolderPath();

  handleNpmRegistry();

  handleNpmDependency();

  checkIsAliInternal();

  handleApp();

  handleBrowserExtension();
};
