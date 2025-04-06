import { StructuredToolInterface } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import { LLM } from "../llm/model.js";
import { prompt, responseFormat } from "./agent.js";

export const createPrebuiltReactAgent = (
  llm: LLM,
  tools: StructuredToolInterface[],
) => {
  const agent = createReactAgent({ prompt, llm, tools, responseFormat });
  return agent;
};
