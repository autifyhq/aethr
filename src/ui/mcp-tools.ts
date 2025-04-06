import { performance } from "node:perf_hooks";

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

export const logMcpTools = (tools: StructuredToolInterface[]) => {
  logger.info(
    { tools: tools.map((tool) => tool.name).join(", ") },
    `Loaded MCP tools`,
  );
};

export const logMcpCall = async (
  tool: Tool,
  args: Parameters<Tool["invoke"]>,
  invoke: (...args: Parameters<Tool["invoke"]>) => Promise<unknown>,
) => {
  logger.info({ input: args[0] }, `MCP start: ${tool.name}`);
  const start = performance.now();
  const result = await invoke(...args);
  const end = performance.now();
  const duration = elapsed(start, end);
  // @ts-expect-error The caller doesn't know the type neither.
  const content = result?.content as string;
  const truncated = truncate(content, 100);
  logger.info({ content: truncated }, `MCP end:   ${tool.name} (${duration})`);
  logger.debug(`MCP end:   ${tool.name} (${duration})\n${content}`);
  return result;
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
