# Product Context: Aethr

## Purpose

Bridges natural language and automated testing by:

- Lowering technical barriers to web testing
- Reducing time spent writing test code
- Connecting plain English specs to automated execution

## Target Users

- QA professionals (rapid test creation)
- Product managers (code-free verification)
- Developers (quick prototyping)
- Non-technical stakeholders (validation)

## UX Goals

- **Simplicity**: Plain English test scenarios
- **Transparency**: Clear execution feedback
- **Reliability**: Consistent interpretation
- **Efficiency**: Minimal time-to-execution
- **Low friction**: Simple setup

## Key Features

1. Natural language test parsing
2. ReAct agent for intelligent interpretation
3. Multi-LLM support (OpenAI, Anthropic, Google, AWS, Groq, Cohere, Ollama, etc.)
4. Browser automation via Playwright MCP
5. Terminal UI with Pino logger for real-time feedback
6. Comprehensive error handling with recovery strategies
7. Token usage tracking and cost calculation
8. Environment variable substitution in test scenarios

## Workflows

1. **Create**: Write plain English steps in text file
2. **Run**: Execute `aethr run <file>` with optional parameters and view progress
   - Customize behavior with CLI options:
     - `--temperature` for LLM creativity control
     - `--think-tool` for explicit reasoning
     - `--reasoning` for MCP tool reasoning
     - `--recursion-limit` for limiting agent steps
     - `-c/--config-file` for custom configuration
     - `-p/--profile` for different profiles
3. **Debug**: Review detailed terminal output with token usage and cost information

## Integration

- Playwright MCP for browser automation
- Multiple LLM APIs via environment variables
- CI/CD via GitHub Actions and other platforms
- Pipeline integration with exit code handling

## Success Metrics

- Test execution success rate
- Time saved vs. coded tests
- Non-technical user adoption
- Interpretation accuracy
- User satisfaction
