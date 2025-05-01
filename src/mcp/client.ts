import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { logMcpClientClose, logMcpClientStdioStart } from "../ui/mcp-tools.js";
import { StdioServerConfig } from "./config.js";

export const createMcpClient = async (
  name: string,
  serverConfig: StdioServerConfig,
  options: { tempDir: string },
): Promise<Client> => {
  const client = new Client({ name, version: "1.0.0" });
  const command = serverConfig.command;
  const args = (serverConfig.args ?? []).map((arg) =>
    arg.replace(/\$\{TEMP_DIR\}/g, options.tempDir),
  );
  const env = {
    ...(process.env as Record<string, string>),
    ...serverConfig.env,
  };
  logMcpClientStdioStart(name, command, args);
  await client.connect(new StdioClientTransport({ command, args, env }));
  patchClientClose(name, client);
  return client;
};

const patchClientClose = (name: string, client: Client) => {
  const originalClose = client.close.bind(client);
  client.close = async () => {
    logMcpClientClose(name);
    await originalClose();
  };
};
