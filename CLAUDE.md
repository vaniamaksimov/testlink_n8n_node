# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package that integrates with TestLink test management system via its XML-RPC API.

## Commands

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Development mode (watches for changes)
npm run dev

# Lint and fix
npm run lint

# Create a release
npm run release
```

## Architecture

### Directory Structure
- `credentials/` - n8n credential definitions (API authentication)
- `nodes/TestLink/` - Main node implementation

### Key Files
- `nodes/TestLink/TestLink.node.ts` - Node definition with resources/operations UI and execution logic
- `nodes/TestLink/GenericFunctions.ts` - XML-RPC request builder, parser, and API helper functions
- `credentials/TestLinkApi.credentials.ts` - TestLink API credential configuration

### n8n Node Pattern
The node follows standard n8n patterns:
- `description` object defines the UI (resources, operations, input fields)
- `execute()` method handles runtime logic, iterating over input items
- Credentials are accessed via `this.getCredentials()`
- HTTP requests use `this.helpers.request()`

### TestLink XML-RPC Integration
- All API calls go through `testLinkApiRequest()` in GenericFunctions.ts
- Builds XML-RPC request bodies with method name and params
- Parses XML-RPC responses back to JSON
- API key (`devKey`) is automatically injected into every request

### Supported Resources
- Test Project, Test Plan, Test Suite, Test Case, Build, Execution

## TestLink API Reference
API endpoint: `{host}/lib/api/xmlrpc/v1/xmlrpc.php`

Key methods used:
- `tl.getProjects`, `tl.getTestProjectByName`
- `tl.getProjectTestPlans`, `tl.getTestPlanByName`
- `tl.getFirstLevelTestSuitesForTestProject`, `tl.getTestSuiteByID`
- `tl.getTestCase`, `tl.getTestCasesForTestSuite`
- `tl.getBuildsForTestPlan`, `tl.createBuild`
- `tl.reportTCResult`, `tl.getLastExecutionResult`
