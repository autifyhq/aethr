import { ToolMessage } from "@langchain/core/messages";
import { StructuredToolInterface } from "@langchain/core/tools";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { JsonSchema7ObjectType } from "zod-to-json-schema";

import { thinkTool } from "../agent/agent.js";
import { logMcpEnd, logMcpStart, logMcpTools } from "../ui/mcp-tools.js";
import { createMcpClient } from "./client.js";
import { McpServersConfig } from "./config.js";

export const createMcpTools = async (
  config: McpServersConfig,
  options: { thinkTool: boolean; reasoning: boolean; tempDir: string },
): Promise<{
  tools: StructuredToolInterface[];
  close: () => Promise<void>;
}> => {
  const clients: Client[] = [];
  const mcpTools = (
    await Promise.all(
      Object.entries(config).map(async ([name, serverConfig]) => {
        const client = await createMcpClient(name, serverConfig, options);
        clients.push(client);
        return await createTools(name, client, options);
      }),
    )
  ).flat();
  const tools = [...mcpTools, ...(options.thinkTool ? [thinkTool] : [])];
  logMcpTools(tools);
  const close = async () => {
    await Promise.all(
      clients.map(async (client) => {
        await client.close();
      }),
    );
  };
  return { tools, close };
};

const createTools = async (
  name: string,
  client: Client,
  options: { reasoning?: boolean } = {},
): Promise<StructuredToolInterface[]> => {
  const mcpTools = await loadMcpTools(name, client, {
    throwOnLoadError: true,
    prefixToolNameWithServerName: true,
    additionalToolNamePrefix: "",
  });
  return mcpTools.map((tool) => {
    patchToolInvoke(tool);
    if (options.reasoning) patchToolSchemaReasoning(tool);
    return tool;
  });
};

// Patch tool.invoke for better logging.
const patchToolInvoke = (tool: StructuredToolInterface) => {
  const originalInvoke = tool.invoke.bind(tool);
  tool.invoke = async (...args) => {
    const start = logMcpStart(tool, args);
    const result = (await originalInvoke(...args)) as ToolMessage;
    logMcpEnd(tool, start, result);
    return result;
  };
};

// Patch tool.schema for adding reasoning parameter.
const patchToolSchemaReasoning = (tool: StructuredToolInterface) => {
  const originalSchema = tool.schema as JsonSchema7ObjectType;
  tool.schema = {
    ...originalSchema,
    properties: {
      // Important to keep reasoning at the top of the schema so that LLM think about it first.
      reasoning: {
        type: "string",
        description:
          "Reasoning behind this tool's choice. Use the same language as the input.",
      },
      ...originalSchema.properties,
    },
  };
};
