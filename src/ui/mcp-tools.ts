import { performance } from "node:perf_hooks";

import { ToolMessage } from "@langchain/core/messages";
import { StructuredToolInterface } from "@langchain/core/tools";
import truncate from "cli-truncate";

import { logger } from "./logger.js";

type Tool = StructuredToolInterface;

function elapsed(start: number, end: number): string {
  const elapsed = end - start;
  if (elapsed < 1000) {
    return `${elapsed.toFixed(0)}ms`;
  }
  return `${(elapsed / 1000).toFixed(2)}s`;
}

export const logMcpTools = (tools: Tool[]) => {
  logger.info(
    { tools: tools.map((tool) => tool.name).join(", ") },
    `Loaded MCP tools`,
  );
};

export const logMcpStart = (
  tool: Tool,
  args: Parameters<Tool["invoke"]>,
): number => {
  logger.info({ input: args[0] }, `MCP start: ${tool.name}`);
  return performance.now();
};

export const logMcpEnd = (tool: Tool, start: number, result: ToolMessage) => {
  const end = performance.now();
  const duration = elapsed(start, end);
  const truncated = truncate(JSON.stringify(result.content), 200);
  logger.info({ content: truncated }, `MCP end:   ${tool.name} (${duration})`);
  logger.debug(`MCP end:   ${tool.name}\n${JSON.stringify(result.content)}`);
};

export const logMcpClientStdioStart = (
  name: string,
  command: string,
  args: string[],
) => {
  logger.info(
    `Starting MCP client stdio - ${name}: ${command} ${args.join(" ")}`,
  );
};

export const logMcpClientClose = (name: string) => {
  logger.info(`Closing MCP client: ${name}`);
};
