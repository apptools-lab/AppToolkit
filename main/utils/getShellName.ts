/**
 * get current shell name. e.g. zsh/sh/bash
 */
function getShellName(): string {
  const shellPath = process.env.SHELL;
  const splitPaths = shellPath.split('/');
  return splitPaths[splitPaths.length - 1];
}

export default getShellName;
