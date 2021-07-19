import checkCommandInstalled from '../utils/checkCommandInstalled';

function checkNpmInstalled() {
  return checkCommandInstalled('npm');
}

export default checkNpmInstalled;
