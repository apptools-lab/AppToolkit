import * as shell from 'shelljs';

function isCommandInstalled(command: string) {
  return !!shell.which(command);
}

export default isCommandInstalled;
