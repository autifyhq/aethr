import { BaseMessageLike, isAIMessageChunk } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { StreamEvent } from "@langchain/core/tracers/log_stream";
import { z } from "zod";

import { logThought } from "../ui/think-tool.js";

export const prompt = `
You're an QA professional and going to test a web application.
Let's think step-by-step.
If the input message isn't English, use the input's language as your output's language.
Use provided MCP tools to manipulate the browser.
Use only one tool at a time because the response (snapshot) might be changed by the other tools.
Never return more than one tool in the same response.
Most of the time, you don't need browser_snapshot tool because the tool would take a snapshot automatically.
When you see \${{...}} in the scenario, the real value would be substituted by the agent before sending to the browser,
so please specify the value as-is in the tool's arguments.
Never generate the value for \${{...}} by yourself.
For example, \${{URL}} is fine because the value would be substituted by the agent or tools.
When you specify an element using \`ref\` in the snapshot, please use the \`ref\` from the latest snapshot
because the older \`ref\` might be staled.
The format of \`ref\` is something like \`s1e3\` where \`s1\` is the snapshot id and \`e3\` is the element id.
When you assert, use the user-provided expected value as-is. This is the important condition to assert the expectation.
Do not generate the expected value by yourself or from the snapshot. Assertion is expected to fail.
If assertion is FAIL, no need to retry the same assertion and finish the test there.
When you describe the assertion result, mention whether it is asserted against an element or the page.
When think_tool is available, call it before calling the actual tool every time to think about it.
When you finish the task, just provide one sentence.
`;

export const responseFormat = z.object({
  summary: z
    .string()
    .describe(
      "The summary of the whole test, what you saw and what you did, step-by-step. Use the same language as the original user's input. When you describe the assertion, mention whether it is asserted against an element or the page.",
    ),
  result: z
    .enum(["PASS", "FAIL"])
    .describe(
      "The final verdict of the entire test. It must be either PASS or FAIL.",
    ),
});
export type ResponseFormat = z.infer<typeof responseFormat>;

interface Input {
  messages: BaseMessageLike[];
}
type Options = Partial<Parameters<Runnable["streamEvents"]>[1]>;
type StreamToken = (token: string) => void;
// Following the prebuilt ReAct agent's format.
const output = z.object({
  data: z.object({
    output: z.object({
      structuredResponse: responseFormat,
    }),
  }),
});

export const thinkTool = tool(
  ({ thought }) => {
    logThought(thought);
    return "Call the next tool you picked. Don't call this tool in a row.";
  },
  {
    name: "think_tool",
    description:
      "Call this tool every time before actually calling the actual tool and think your reasoning process. The call sequence is: call this tool, then call the actual tool. Never call this tool in a row.",
    schema: z.object({
      thought: z
        .string()
        .describe(
          "A reasoning about the next tool call. Use the same language as the original user's input.",
        ),
    }),
  },
);

export const invokeAgent = async (
  agent: Runnable,
  input: Input,
  streamToken: StreamToken,
  options?: Options,
): Promise<ResponseFormat> => {
  try {
    const stream = agent.streamEvents(input, { version: "v2", ...options });
    let lastStreamEvent: StreamEvent | undefined;
    for await (const streamEvent of stream) {
      lastStreamEvent = streamEvent;
      const { event, data } = streamEvent;
      if (
        event === "on_chat_model_stream" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        isAIMessageChunk(data.chunk)
      ) {
        const { tool_call_chunks } = data.chunk;
        if (
          tool_call_chunks &&
          tool_call_chunks.length === 0 &&
          data.chunk.text
        ) {
          streamToken(data.chunk.text);
        }
      }
    }
    const parsed = output.safeParse(lastStreamEvent);
    return parsed.success
      ? parsed.data.data.output.structuredResponse
      : {
          result: "FAIL",
          summary: `Error: Invalid format of the last event ${JSON.stringify(lastStreamEvent)} (${parsed.error.message})`,
        };
  } catch (error) {
    return {
      result: "FAIL",
      summary: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
