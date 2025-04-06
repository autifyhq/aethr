import { inspect } from "node:util";

import { AIMessageChunk } from "@langchain/core/messages";
import chalk from "chalk";

import { Usage } from "../metrics/usage.js";
import { logger } from "./logger.js";

const llm = (usage: Usage): string => {
  switch (usage.provider) {
    case "openai":
      return chalk.cyan(`OpenAI/${usage.model}`);
    case "openrouter":
      return chalk.cyan(`OpenRouter/${usage.model}`);
    case "anthropic":
      return chalk.cyan(`Anthropic/${usage.model}`);
    case "bedrock":
      return chalk.cyan(`Bedrock/${usage.model}`);
    case "google":
      return chalk.cyan(`Google/${usage.model}`);
    case "vertexai":
      return chalk.cyan(`VertexAI/${usage.model}`);
    case "azure_openai":
      return chalk.cyan(`Azure OpenAI/${usage.model}`);
    case "groq":
      return chalk.cyan(`Groq/${usage.model}`);
    case "cohere":
      return chalk.cyan(`Cohere/${usage.model}`);
    case "ollama":
      return chalk.cyan(`Ollama/${usage.model}`);
  }
};

const cost = (n: number | undefined = 0) =>
  chalk.yellow(
    "$" +
      n.toLocaleString("en-US", {
        minimumFractionDigits: 5,
        maximumFractionDigits: 5,
      }),
  );

const token = (n: number | undefined = 0) =>
  chalk.blue(n.toLocaleString("en-US") + "tk");

const toolCalls = (calls: NonNullable<AIMessageChunk["tool_calls"]>) =>
  calls
    .map((call) => {
      const args = inspect(call.args, {
        depth: null,
        colors: true,
        compact: true,
        breakLength: Infinity,
      });
      return (
        chalk.red("Call ") +
        chalk.magenta(`${call.name}(`) +
        args +
        chalk.magenta(")")
      );
    })
    .join(", ");

export const logUsage = (usage: Usage, message: AIMessageChunk) => {
  const tag = chalk.cyan(
    `LLM usage: ${llm(usage)} (${cost(usage.cost.total)})`,
  );
  if (message.tool_calls && message.tool_calls.length > 0) {
    const log = toolCalls(message.tool_calls);
    logger.info(`${tag} ${log}`);
  } else {
    const log = chalk.red("Text");
    const textLength = message.text.length;
    logger.info({ textLength }, `${tag} ${log}`);
    logger.debug(`${tag} ${log} ${message.text}`);
  }
};

export const logTotalUsage = (usage: Usage) => {
  const tag = chalk.cyan(
    `LLM usage: ${llm(usage)} (${cost(usage.cost.total)})`,
  );
  const details = [
    `input: ${cost(usage.cost.input)}/${token(usage.tokens.input)}`,
    `output: ${cost(usage.cost.output)}/${token(usage.tokens.output)}`,
    `cachedRead: ${cost(usage.cost.cachedRead)}/${token(
      usage.tokens.cachedRead,
    )}`,
    `cachedWrite: ${cost(usage.cost.cachedWrite)}/${token(
      usage.tokens.cachedWrite,
    )}`,
  ].join(" ");
  logger.info(`${tag} ${chalk.red("Total")} ${details}`);
};
