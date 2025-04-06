export interface RunCommandOptions {
  configFile: string;
  profile: string;
  recursionLimit?: number;
  temperature?: number;
  thinkTool?: boolean;
  reasoning?: boolean;
}
