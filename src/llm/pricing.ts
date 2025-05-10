import { Provider } from "../llm/model.js";

export const getPricing = (provider: Provider, model: string) => {
  return pricing[provider][model];
};

const pricing: Record<
  Provider,
  Record<
    string,
    | {
        input: number;
        output: number;
        cachedRead?: number;
        cachedWrite?: number;
      }
    | undefined
  >
> = {
  openai: {
    "gpt-4o-mini": {
      input: 0.15,
      output: 0.6,
      cachedRead: 0.075,
    },
    "gpt-4o": {
      input: 2.5,
      output: 10.0,
      cachedRead: 1.25,
    },
    "gpt-4.1": {
      input: 2.0,
      output: 8.0,
      cachedRead: 0.5,
    },
    "gpt-4.1-mini": {
      input: 0.4,
      output: 1.6,
      cachedRead: 0.1,
    },
    "gpt-4.1-nano": {
      input: 0.1,
      output: 0.4,
      cachedRead: 0.025,
    },
  },
  openrouter: {
    "openai/gpt-4o": {
      input: 2.5,
      output: 10.0,
      cachedRead: 1.25,
      cachedWrite: 0.0,
    },
    "openai/gpt-4o-mini": {
      input: 0.15,
      output: 0.6,
      cachedRead: 0.075,
      cachedWrite: 0.0,
    },
    "openai/gpt-4.1": {
      input: 2.0,
      output: 8.0,
      cachedRead: 0.5,
    },
    "openai/gpt-4.1-mini": {
      input: 0.4,
      output: 1.6,
      cachedRead: 0.1,
    },
    "google/gemini-2.0-flash-001": {
      input: 0.1,
      output: 0.4,
      cachedRead: 0.025,
      cachedWrite: 1.0,
    },
    "google/gemini-2.0-flash-lite-001": {
      input: 0.075,
      output: 0.3,
    },
    "google/gemini-2.5-flash-preview": {
      input: 0.15,
      output: 0.6,
      cachedRead: 0.0,
      cachedWrite: 0.0,
    },
    "google/gemini-2.5-pro-preview": {
      // TODO: Support tiered pricing
      input: 1.25,
      output: 10.0,
      cachedRead: 0.31,
    },
    "deepseek/deepseek-chat": {
      input: 0.4,
      output: 0.89,
      cachedRead: 0.04,
      cachedWrite: 0.4,
    },
  },
  anthropic: {
    "claude-3-7-sonnet-20250219": {
      input: 3.0,
      output: 15.0,
      cachedRead: 0.3,
      cachedWrite: 3.75,
    },
    "claude-3-5-sonnet-20241022": {
      input: 3.0,
      output: 15.0,
      cachedRead: 0.3,
      cachedWrite: 3.75,
    },
    "claude-3-5-haiku-20241022": {
      input: 0.8,
      output: 4.0,
      cachedRead: 0.08,
      cachedWrite: 1.0,
    },
    "claude-3-opus-20240229": {
      input: 15.0,
      output: 75.0,
      cachedRead: 1.5,
      cachedWrite: 18.75,
    },
    "claude-3-haiku-20240307": {
      input: 0.25,
      output: 1.25,
      cachedRead: 0.03,
      cachedWrite: 0.3,
    },
  },
  bedrock: {
    "us.amazon.nova-pro-v1:0": {
      input: 0.8,
      output: 3.2,
    },
    "us.amazon.nova-lite-v1:0": {
      input: 0.06,
      output: 0.24,
    },
    "us.amazon.nova-micro-v1:0": {
      input: 0.035,
      output: 0.14,
    },
    "anthropic.claude-3-7-sonnet-20250219-v1:0": {
      input: 3.0,
      output: 15.0,
      cachedRead: 0.3,
      cachedWrite: 3.75,
    },
    "anthropic.claude-3-5-sonnet-20241022-v2:0": {
      input: 3.0,
      output: 15.0,
      cachedRead: 0.3,
      cachedWrite: 3.75,
    },
    "anthropic.claude-3-5-haiku-20241022-v1:0": {
      input: 1.0,
      output: 5.0,
      cachedRead: 0.08,
      cachedWrite: 1.0,
    },
    "anthropic.claude-3-5-sonnet-20240620-v1:0": {
      input: 3.0,
      output: 15.0,
    },
    "anthropic.claude-3-opus-20240229-v1:0": {
      input: 15.0,
      output: 75.0,
    },
    "anthropic.claude-3-sonnet-20240229-v1:0": {
      input: 3.0,
      output: 15.0,
    },
    "anthropic.claude-3-haiku-20240307-v1:0": {
      input: 0.25,
      output: 1.25,
    },
    "deepseek.r1-v1:0": {
      input: 1.35,
      output: 5.4,
    },
  },
  google: {
    "gemini-2.0-flash": {
      input: 0.1,
      output: 0.4,
      cachedRead: 0.025,
      cachedWrite: 1.0,
    },
    "gemini-2.0-flash-lite": {
      input: 0.075,
      output: 0.3,
    },
    "gemini-2.5-flash-preview": {
      input: 0.15,
      output: 0.6,
      cachedRead: 0.0,
      cachedWrite: 0.0,
    },
    "gemini-2.5-pro-preview": {
      // TODO: Support tiered pricing
      input: 1.25,
      output: 10.0,
      cachedRead: 0.31,
    },
  },
  vertexai: {
    "claude-3-7-sonnet@20250219": {
      input: 3.0,
      output: 15.0,
      cachedRead: 0.3,
      cachedWrite: 3.75,
    },
    "claude-3-5-sonnet-v2@20241022": {
      input: 3.0,
      output: 15.0,
      cachedRead: 0.3,
      cachedWrite: 3.75,
    },
    "claude-3-5-haiku@20241022": {
      input: 1.0,
      output: 5.0,
      cachedRead: 0.1,
      cachedWrite: 1.25,
    },
    "claude-3-opus@20240229": {
      input: 15.0,
      output: 75.0,
      cachedRead: 1.5,
      cachedWrite: 18.75,
    },
    "claude-3-haiku@20240307": {
      input: 0.25,
      output: 1.25,
      cachedRead: 0.03,
      cachedWrite: 0.3,
    },
    "gemini-2.0-flash": {
      input: 0.15,
      output: 0.6,
      cachedRead: 0.025,
      cachedWrite: 0.025,
    },
    "gemini-2.0-flash-lite": {
      input: 0.075,
      output: 0.3,
      cachedRead: 0.025,
      cachedWrite: 0.025,
    },
    "gemini-2.5-flash-preview": {
      input: 0.15,
      output: 0.6,
      cachedRead: 0.0,
      cachedWrite: 0.0,
    },
    "gemini-2.5-pro-preview": {
      // TODO: Support tiered pricing
      input: 1.25,
      output: 10.0,
      cachedRead: 0.31,
    },
  },
  groq: {
    "llama-3.1-8b-instant": {
      input: 0.05,
      output: 0.1,
    },
  },
  azure_openai: {},
  cohere: {},
  ollama: {},
} as const;
