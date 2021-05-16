import * as shell from 'shelljs';

function isCliInstalled(cliName: string) {
  return !!shell.which(cliName);
}

export default isCliInstalled;
