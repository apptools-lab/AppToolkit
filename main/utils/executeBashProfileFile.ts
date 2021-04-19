import * as execa from 'execa';

/**
 * 执行配置文件
 * e.g.: $ source ~/.zshrc
 */
async function executeBashProfileFile(filePath: string) {
  await execa.command(`source ${filePath}`);
}

export default executeBashProfileFile;
