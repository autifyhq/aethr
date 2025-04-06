import {
  BaseMessageLike,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { ToolCall } from "@langchain/core/messages/tool";
import { StructuredToolInterface } from "@langchain/core/tools";
import { addMessages, entrypoint, task } from "@langchain/langgraph";

import { LLM } from "../llm/model.js";
import { prompt, ResponseFormat, responseFormat } from "./agent.js";

export const createCustomAgent = (
  llm: LLM,
  tools: StructuredToolInterface[],
) => {
  const callModel = task("callModel", async (messages: BaseMessageLike[]) => {
    const response = await llm.bindTools(tools).invoke(messages);
    return response;
  });
  const callTool = task(
    "callTool",
    async (toolCall: ToolCall): Promise<ToolMessage> => {
      const name = toolCall.name;
      const tool_call_id = toolCall.id ?? "";
      const tool = tools.find((tool) => tool.name === name);
      if (!tool) {
        const content = `Error: Tool '${name}' was requested but is not available.`;
        return new ToolMessage({ content, tool_call_id, name });
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await tool.invoke(toolCall);
        const content =
          typeof result === "string" ? result : JSON.stringify(result);
        return new ToolMessage({ content, tool_call_id, name });
      } catch (error) {
        const content = `Tool '${name}' failed with error: ${
          error instanceof Error ? error.name : "Error"
        }: ${error instanceof Error ? error.message : String(error)}`;
        return new ToolMessage({ content, tool_call_id, name });
      }
    },
  );
  const callVerdict = task(
    "callVerdict",
    async (messages: BaseMessageLike[]): Promise<ResponseFormat> => {
      return await llm
        .withStructuredOutput(responseFormat)
        .invoke(messages.slice(1));
    },
  );
  const agent = entrypoint(
    "agent",
    async ({ messages }: { messages: BaseMessageLike[] }) => {
      const systemMessage = new SystemMessage(prompt);
      let currentMessages = [systemMessage, ...messages];
      let llmResponse = await callModel(currentMessages);
      while (llmResponse.tool_calls?.length) {
        const toolResults = await Promise.all(
          llmResponse.tool_calls.map((toolCall) => {
            return callTool(toolCall);
          }),
        );
        currentMessages = addMessages(currentMessages, [
          llmResponse,
          ...toolResults,
        ]);
        llmResponse = await callModel(currentMessages);
      }
      const structuredResponse = await callVerdict(currentMessages);
      return { structuredResponse };
    },
  );
  return agent;
};
