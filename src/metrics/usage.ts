import { AIMessageChunk } from "@langchain/core/messages";

import { Model, Provider } from "../llm/model.js";
import { getPricing } from "../llm/pricing.js";

export interface Usage {
  provider: Provider;
  model: string;
  tokens: {
    input: number;
    output: number;
    cachedRead?: number;
    cachedWrite?: number;
  };
  cost: {
    input?: number;
    output?: number;
    cachedRead?: number;
    cachedWrite?: number;
    total?: number;
    totalInResponse?: number;
  };
}

export const getUsage = (
  model: Model,
  {
    usage_metadata,
    response_metadata,
  }: Pick<AIMessageChunk, "usage_metadata" | "response_metadata">,
): Usage => {
  const output = usage_metadata?.output_tokens ?? 0;
  const cachedRead = usage_metadata?.input_token_details?.cache_read ?? 0;
  const cachedWrite = usage_metadata?.input_token_details?.cache_creation ?? 0;
  // TODO: Investigate the logic of non OpenAI /OpenRouter providers
  const input =
    model.provider === "openai" || model.provider === "openrouter"
      ? (usage_metadata?.input_tokens ?? 0) - cachedRead - cachedWrite
      : (usage_metadata?.input_tokens ?? 0);
  const usage = {
    provider: model.provider,
    model: model.llm.model,
    tokens: { input, output, cachedRead, cachedWrite },
    cost: {},
  } satisfies Usage;
  return calculateCost(usage, { response_metadata });
};

const calculateCost = (
  usage: Usage,
  { response_metadata }: Pick<AIMessageChunk, "response_metadata">,
): Usage => {
  const price = getPricing(usage.provider, usage.model);
  if (!price) return { ...usage, cost: {} };
  const input = (price.input / 1_000_000) * usage.tokens.input;
  const output = (price.output / 1_000_000) * usage.tokens.output;
  const cachedRead = price.cachedRead
    ? (price.cachedRead / 1_000_000) * (usage.tokens.cachedRead ?? 0)
    : undefined;
  const cachedWrite = price.cachedWrite
    ? (price.cachedWrite / 1_000_000) * (usage.tokens.cachedWrite ?? 0)
    : undefined;
  const total = input + output + (cachedRead ?? 0) + (cachedWrite ?? 0);
  const totalInResponse =
    usage.provider === "openrouter"
      ? (response_metadata as { usage?: { cost?: number } }).usage?.cost
      : undefined;
  return {
    ...usage,
    cost: {
      input,
      output,
      total,
      ...(cachedRead !== undefined && { cachedRead }),
      ...(cachedWrite !== undefined && { cachedWrite }),
      ...(totalInResponse !== undefined && { totalInResponse }),
    },
  };
};
