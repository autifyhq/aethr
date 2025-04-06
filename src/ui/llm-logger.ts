import { BaseMessage } from "@langchain/core/messages";
import { AgentRun, BaseTracer, Run } from "@langchain/core/tracers/base";

import { logger } from "./logger.js";

function elapsed(run: Run): string {
  if (!run.end_time) return "";
  const elapsed = run.end_time - run.start_time;
  if (elapsed < 1000) {
    return `${elapsed.toString()}ms`;
  }
  return `${(elapsed / 1000).toFixed(2)}s`;
}

export class LLMLoggerCallbackHandler extends BaseTracer {
  name = "LLMLoggerCallbackHandler";

  protected persistRun(_run: Run): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Method used to get all the parent runs of a given run.
   * @param run The run whose parents are to be retrieved.
   * @returns An array of parent runs.
   */
  getParents(run: Run) {
    const parents: Run[] = [];
    let currentRun = run;
    while (currentRun.parent_run_id) {
      const parent = this.runMap.get(currentRun.parent_run_id);
      if (parent) {
        parents.push(parent);
        currentRun = parent;
      } else {
        break;
      }
    }
    return parents;
  }

  /**
   * Method used to get a string representation of the run's lineage, which
   * is used in logging.
   * @param run The run whose lineage is to be retrieved.
   * @returns A string representation of the run's lineage.
   */
  getBreadcrumbs(run: Run) {
    const parents = this.getParents(run).reverse();
    const string = [...parents, run]
      .map((parent) => {
        const name = `${parent.execution_order.toString()}:${parent.run_type}:${parent.name}`;
        return name;
      })
      .join(" > ");
    return string;
  }

  onChainStart(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    logger.debug({ inputs: run.inputs }, `Chain start: ${crumbs}`);
  }

  onChainEnd(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    logger.debug(
      { outputs: run.outputs },
      `Chain end: ${crumbs} (${elapsed(run)})`,
    );
  }

  onChainError(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    logger.error(
      { error: run.error },
      `Chain error: ${crumbs} (${elapsed(run)})`,
    );
  }

  onLLMStart(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    logger.debug({ inputs: run.inputs }, `LLM start: ${crumbs}`);
    const messagesLength = (run.inputs.messages as BaseMessage[][])[0].length;
    logger.info({ messagesLength }, `LLM start: ${crumbs}`);
  }

  onLLMEnd(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    logger.debug(
      { outputs: run.outputs },
      `LLM end:   ${crumbs} (${elapsed(run)})`,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const tokenUsage = run.outputs?.llmOutput?.tokenUsage as unknown;
    logger.info({ tokenUsage }, `LLM end:   ${crumbs} (${elapsed(run)})`);
  }

  onLLMError(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    logger.error(
      { error: run.error },
      `LLM error: ${crumbs} (${elapsed(run)})`,
    );
  }

  onToolStart(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    logger.debug({ inputs: run.inputs }, `Tool start: ${crumbs}`);
  }

  onToolEnd(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    logger.debug(
      { outputs: run.outputs },
      `Tool end: ${crumbs} (${elapsed(run)})`,
    );
  }

  onToolError(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    logger.error(
      { error: run.error },
      `Tool error: ${crumbs} (${elapsed(run)})`,
    );
  }

  onRetrieverStart(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    logger.debug({ inputs: run.inputs }, `Retriever start: ${crumbs}`);
  }

  onRetrieverEnd(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    logger.debug(
      { outputs: run.outputs },
      `Retriever end: ${crumbs} (${elapsed(run)})`,
    );
  }

  onRetrieverError(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    logger.error(
      { error: run.error },
      `Retriever error: ${crumbs} (${elapsed(run)})`,
    );
  }

  onAgentAction(run: Run): void {
    const agentRun = run as AgentRun;
    const crumbs = this.getBreadcrumbs(run);
    logger.debug(
      { action: agentRun.actions.at(-1) },
      `Agent action: ${crumbs}`,
    );
  }

  onAgentEnd(run: Run): void | Promise<void> {
    const agentRun = run as AgentRun;
    const crumbs = this.getBreadcrumbs(run);
    logger.debug({ action: agentRun.actions.at(-1) }, `Agent end: ${crumbs}`);
  }

  onText(run: Run): void | Promise<void> {
    const crumbs = this.getBreadcrumbs(run);
    logger.debug({ run }, `Text: ${crumbs}`);
  }
}
