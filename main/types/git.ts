export interface AddUserConfig {
  configName: string;
  SSHPublicKey: string;
  user: { name: string; email: string; hostName: string };
}

export interface UserGitConfig {
  SSHPublicKey: string;
  configName: string;
  gitDirs: string[];
  user: { name: string; email: string; hostName: string };
}
