import { performance } from "node:perf_hooks";

import { MessageContent, ToolMessage } from "@langchain/core/messages";
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

export const logMcpCall = async (
  tool: Tool,
  args: Parameters<Tool["invoke"]>,
  invoke: (...args: Parameters<Tool["invoke"]>) => Promise<unknown>,
) => {
  logger.info({ input: args[0] }, `MCP start: ${tool.name}`);
  const start = performance.now();
  const result = (await invoke(...args)) as ToolMessage;
  const end = performance.now();
  const duration = elapsed(start, end);
  const content = concatTextContent(result.content);
  const truncated = truncate(content, 100);
  logger.info({ content: truncated }, `MCP end:   ${tool.name} (${duration})`);
  logger.debug(`MCP end:   ${tool.name} (${duration})\n${content}`);
  result.content = content;
  return result;
};

const concatTextContent = (content: MessageContent): string => {
  // If the content is a string, return it directly
  if (typeof content === "string") return content;

  // If the content is array, filter only text type content and join them with new lines
  if (Array.isArray(content))
    return content
      .flatMap((content) => (typeof content === "string" ? [content] : []))
      .join("\n");

  // Fallback to JSON.stringify for the other unknown types in case the type will be evolved
  return JSON.stringify(content);
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
