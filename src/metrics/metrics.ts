import { EventEmitter } from "node:events";

import { Callbacks } from "@langchain/core/callbacks/manager";
import { AIMessageChunk, isAIMessageChunk } from "@langchain/core/messages";
import { ChatGenerationChunk } from "@langchain/core/outputs";

import { Model } from "../llm/model.js";
import { getUsage, Usage } from "./usage.js";

export const createMetrics = (model: Model) => {
  const totalUsage: Usage = {
    provider: model.provider,
    model: model.llm.model,
    tokens: {
      input: 0,
      output: 0,
    },
    cost: {
      input: 0,
      output: 0,
      total: 0,
    },
  };
  const eventEmitter = new EventEmitter<{
    usage: [usage: Usage, message: AIMessageChunk];
  }>();
  const addUsage = (message: AIMessageChunk) => {
    const newUsage = getUsage(model, message);
    for (const key of Object.keys(
      newUsage.tokens,
    ) as (keyof typeof newUsage.tokens)[]) {
      if (newUsage.tokens[key]) {
        totalUsage.tokens[key] =
          (totalUsage.tokens[key] ?? 0) + (newUsage.tokens[key] ?? 0);
      }
    }
    for (const key of Object.keys(
      newUsage.cost,
    ) as (keyof typeof newUsage.cost)[]) {
      if (newUsage.cost[key]) {
        totalUsage.cost[key] =
          (totalUsage.cost[key] ?? 0) + (newUsage.cost[key] ?? 0);
      }
    }
    eventEmitter.emit("usage", newUsage, message);
    return newUsage;
  };
  const callbacks: Callbacks = [
    {
      handleLLMEnd(output) {
        const generation = output.generations[0][0] as
          | ChatGenerationChunk
          | undefined;
        if (generation && isAIMessageChunk(generation.message)) {
          const message = generation.message;
          addUsage(message);
        }
      },
    },
  ];
  if (model.llm.callbacks && Array.isArray(model.llm.callbacks)) {
    callbacks.push(...model.llm.callbacks);
  }
  model.llm.callbacks = callbacks;
  return {
    onUsage: (fn: (usage: Usage, message: AIMessageChunk) => void) => {
      eventEmitter.on("usage", fn);
    },
    getTotalUsage: () => ({ ...totalUsage }),
  };
};
