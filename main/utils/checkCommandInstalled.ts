import * as shell from 'shelljs';

function checkCommandInstalled(command: string) {
  return !!shell.which(command);
}

export default checkCommandInstalled;
