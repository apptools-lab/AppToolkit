export interface IAddUserConfig {
  configName: string;
  SSHPublicKey: string;
  user: { name: string; email: string; hostName: string };
}
