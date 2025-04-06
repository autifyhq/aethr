import { ChatAnthropic } from "@langchain/anthropic";
import { ChatBedrockConverse } from "@langchain/aws";
import { ChatCohere } from "@langchain/cohere";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatVertexAI } from "@langchain/google-vertexai";
import { ChatGroq } from "@langchain/groq";
import { ChatOllama } from "@langchain/ollama";
import { AzureChatOpenAI, ChatOpenAI } from "@langchain/openai";

import { LLMLoggerCallbackHandler } from "../ui/llm-logger.js";

export type Provider =
  | "openai"
  | "openrouter"
  | "anthropic"
  | "bedrock"
  | "google"
  | "vertexai"
  | "azure_openai"
  | "groq"
  | "cohere"
  | "ollama";

export type LLM =
  | ChatOpenAI
  | ChatAnthropic
  | ChatBedrockConverse
  | ChatGoogleGenerativeAI
  | ChatVertexAI
  | AzureChatOpenAI
  | ChatGroq
  | ChatCohere
  | ChatOllama;

export interface Model {
  provider: Provider;
  llm: LLM;
}

export const createModel = (
  env: NodeJS.ProcessEnv,
  options: { temperature: number },
): Model => {
  const model = selectModel(env);
  model.llm.temperature = options.temperature;
  model.llm.callbacks = [new LLMLoggerCallbackHandler()];
  return model;
};

const selectModel = (env: NodeJS.ProcessEnv): Model => {
  if (env.OPENAI_MODEL)
    return {
      provider: "openai",
      llm: new ChatOpenAI({ model: env.OPENAI_MODEL }),
    };
  if (env.OPENROUTER_MODEL)
    return {
      provider: "openrouter",
      llm: new ChatOpenAI({
        model: env.OPENROUTER_MODEL,
        apiKey: env.OPENROUTER_API_KEY,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
      }),
    };
  if (env.ANTHROPIC_MODEL)
    return {
      provider: "anthropic",
      llm: new ChatAnthropic({ model: env.ANTHROPIC_MODEL }),
    };
  if (env.BEDROCK_MODEL)
    return {
      provider: "bedrock",
      llm: new ChatBedrockConverse({ model: env.BEDROCK_MODEL }),
    };
  if (env.GOOGLE_MODEL)
    return {
      provider: "google",
      llm: new ChatGoogleGenerativeAI({ model: env.GOOGLE_MODEL }),
    };
  if (env.VERTEXAI_MODEL)
    return {
      provider: "vertexai",
      llm: new ChatVertexAI({ model: env.VERTEXAI_MODEL }),
    };
  if (env.AZURE_OPENAI_MODEL)
    return {
      provider: "azure_openai",
      llm: new AzureChatOpenAI({ model: env.AZURE_OPENAI_MODEL }),
    };
  if (env.GROQ_MODEL)
    return {
      provider: "groq",
      llm: new ChatGroq({ model: env.GROQ_MODEL }),
    };
  if (env.COHERE_MODEL)
    return {
      provider: "cohere",
      llm: new ChatCohere({ model: env.COHERE_MODEL }),
    };
  if (env.OLLAMA_MODEL)
    return {
      provider: "ollama",
      llm: new ChatOllama({ model: env.OLLAMA_MODEL }),
    };
  throw new Error("No provider is configured.");
};
