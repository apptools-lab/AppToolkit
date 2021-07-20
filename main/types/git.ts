export interface IAddUserConfig {
  configName: string;
  hostName: string;
  SSHPublicKey: string;
  user: { name: string; email: string };
}
