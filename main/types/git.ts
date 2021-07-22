export interface IAddUserConfig {
  configName: string;
  SSHPublicKey: string;
  user: { name: string; email: string; hostName: string };
}

export interface IUserConfig {
  SSHPublicKey: string;
  configName: string;
  gitDirs: string[];
  user: { name: string; email: string; hostName: string };
}
