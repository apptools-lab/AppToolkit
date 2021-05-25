import * as execa from 'execa';

/**
 * 执行 bash 配置文件
 * e.g.: $ source ~/.zshrc
 */
async function executeBashConfigFile(filePath: string) {
  await execa.command(`source ${filePath}`);
}

export default executeBashConfigFile;
