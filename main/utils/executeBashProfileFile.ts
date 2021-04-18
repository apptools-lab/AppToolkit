import * as execa from 'execa';

/**
 * e.g.: execute command like $ source ~/.zshrc
 */
async function executeBashProfileFile(filePath: string) {
  await execa.command(`source ${filePath}`);
}

export default executeBashProfileFile;

