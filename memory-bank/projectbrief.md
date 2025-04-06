# 🛠️ Project Brief: Aethr v1.0.0-rc.7

## Overview

Node.js command-line tool that runs natural language test scenarios using LangChain/LangGraph ReAct agent via Playwright MCP, with real-time terminal feedback, comprehensive metrics tracking, and support for multiple LLM providers.

## Command

```bash
aethr run <test_scenario_file> [options]

Options:
  -c, --config-file <file>    Config file path
  -p, --profile <name>        Profile name
  -r, --recursion-limit <num> Set maximum recursion limit for the agent
  --temperature <num>         Set temperature for LLM
  --think-tool                Enable think tool
  --reasoning                 Enable reasoning parameter for MCP tools
```

## Core Requirements

- Natural language test file
- ReAct agent for test interpretation
- Multi-LLM support (OpenAI, Anthropic) via ENV vars
- Playwright MCP browser automation
- CI/CD integration with GitHub Actions

## Goals & Scope

- **Goals**: Make testing accessible to non-technical users, reduce boilerplate, provide intuitive interface, support multiple LLM providers, track token usage and costs
- **In Scope**: Test scenarios, MCP integration, terminal UI, error handling, metrics tracking, environment variable substitution, CI/CD
- **Out of Scope**: Advanced reporting (planned for Phase 2)

## Success Criteria

- Successful login test execution
- Accurate interpretation of natural language
- Proper browser automation
- Clear real-time feedback

## Milestones

1. ✅ CLI Bootstrap with Commander.js
2. ✅ LangGraph Agent with multi-LLM support
3. ✅ MCP Communication with Playwright
4. ✅ Terminal UI with Pino logger
5. ✅ Metrics & Usage tracking with cost calculation
6. ✅ Release Candidate stage (v1.0.0-rc.7)
7. 🔄 Dependency Injection (Phase 2)
8. 🔄 CI/CD Integration (Phase 2)
9. 🔄 Structured Test Results (Phase 2)
