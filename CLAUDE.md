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
  - `handlers/` - Resource-specific operation handlers (modular architecture)
  - `utils/` - Shared utilities (XML-RPC wrapper)

### Key Files
- `nodes/TestLink/TestLink.node.ts` - Node definition with resources/operations UI and execution dispatch (526 lines)
- `nodes/TestLink/handlers/*.ts` - Six resource handlers: testProject, testPlan, testSuite, testCase, build, execution (~212 lines total)
- `nodes/TestLink/utils/xmlrpc.ts` - XML-RPC client wrapper with Promise-based API
- `credentials/TestLinkApi.credentials.ts` - TestLink API credential configuration

### n8n Node Pattern
The node follows standard n8n patterns:
- `description` object defines the UI (resources, operations, input fields)
- `execute()` method handles runtime logic, iterating over input items
- Credentials are accessed via `this.getCredentials()`
- HTTP requests use `this.helpers.request()`

### TestLink XML-RPC Integration
- Uses native `xmlrpc` npm package via wrapper in `utils/xmlrpc.ts`
- `xmlRpcCall()` function provides Promise-based interface to XML-RPC client
- Each handler calls `xmlRpcCall(client, method, params)` for API communication
- API key (`devKey`) is passed as parameter in each request by handlers

### Handler Pattern

After refactoring, all operation logic is extracted into modular handlers:

**Handler modules in `handlers/` directory:**
- `testProject.ts` - Test project operations (getAll, get)
- `testPlan.ts` - Test plan operations (getAll, get)
- `testSuite.ts` - Test suite operations (getAll, get)
- `testCase.ts` - Test case operations (get, getAll)
- `build.ts` - Build operations (getAll, create)
- `execution.ts` - Execution operations (report, getLast)

**Unified handler function signature:**
```typescript
export async function operationName(
  context: IExecuteFunctions,
  client: XmlRpcClient,
  apiKey: string,
  itemIndex: number
): Promise<any>
```

**Execution dispatch pattern** (from [TestLink.node.ts](nodes/TestLink/TestLink.node.ts#L472-L526)):
```typescript
const handlers = {
  testProject: testProjectHandlers,
  testPlan: testPlanHandlers,
  testSuite: testSuiteHandlers,
  testCase: testCaseHandlers,
  build: buildHandlers,
  execution: executionHandlers,
};

const resource = this.getNodeParameter('resource', 0) as string;
const operation = this.getNodeParameter('operation', 0) as string;

const handler = handlers[resource][operation] as HandlerFunction;
responseData = await handler(this, client, credentials.apiKey, i);
```

**Benefits of modular architecture:**
- ✅ **Modularity**: Each resource in separate file (~30-40 lines each)
- ✅ **Testability**: Functions easily isolated for unit testing
- ✅ **Readability**: Main file reduced from 600+ to 526 lines
- ✅ **Maintainability**: New operations added without touching main node file
- ✅ **Type Safety**: Unified signature enforced across all handlers

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
