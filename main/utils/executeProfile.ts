import * as execa from 'execa';

/**
 * execute commands from profile file in the current shell environment
 * e.g.: $ source ~/.zshrc
 */
async function executeProfile(profileFilePath: string) {
  await execa.command(`source ${profileFilePath}`);
}

export default executeProfile;
